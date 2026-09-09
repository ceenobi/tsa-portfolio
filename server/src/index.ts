import path from "node:path";
import compression from "compression";
import cors from "cors";
import type { UserRole } from "@tsa/shared";
import express, {
	type NextFunction,
	type Request,
	type Response,
} from "express";
import helmet from "helmet";
import { connectToDB, gracefulShutdown } from "./config/database.js";
import { env } from "./config/keys.js";
import logger, { logError } from "./config/logger.js";
import { createSessionMiddleware } from "./config/session.js";
import { compressionOptions, helmetOptions } from "./libs/options.js";
import {
	appErrorHandler,
	createExpressLogger,
	notFoundRoutes,
	setupGlobalErrorHandlers,
} from "./middlewares/error.middleware.js";
import { globalLimiter } from "./middlewares/rateLimit.middleware.js";
//routes
import authRoutes from "./routes/auth.routes.js";
import emailRoutes from "./routes/email.routes.js";
import projectRoutes from "./routes/project.routes.js";
import uploadRoutes from "./routes/upload.routes.js";

declare global {
	namespace Express {
		interface Request {
			requestTime?: string;
			rawBody?: Buffer;
		}
	}
}

// Extend express-session SessionData interface
declare module "express-session" {
	interface SessionData {
		userId?: string;
		role?: UserRole;
	}
}

const app = express();

// Trust all proxy hops (Cloudflare + Render edge + internal routing).
// Trusting only 1 hop leaves req.secure false and collapses req.ip to a
// single internal address — breaking secure cookies and per-user rate
// limiting. The app is only reachable through the proxies, so this is safe.
app.set("trust-proxy", true);
//global error handler
setupGlobalErrorHandlers();

app.use("/cron-email", emailRoutes);

// CORS configuration
const allowedOrigins: string[] = [env.CLIENT_URL].filter(Boolean) as string[];

// Local development — Vite dev server
allowedOrigins.push("http://localhost:5178", "http://127.0.0.1:5178");
// Local development — fallback port
allowedOrigins.push("http://localhost:5199", "http://127.0.0.1:5199");

// Render deployments — the service's own *.onrender.com origin
if (process.env.RENDER_EXTERNAL_URL) {
	allowedOrigins.push(process.env.RENDER_EXTERNAL_URL);
}

const corsOptions: cors.CorsOptions = {
	origin: (origin, callback) => {
		if (!origin || allowedOrigins.indexOf(origin) !== -1) {
			callback(null, true);
		} else {
			callback(new Error("Not allowed by CORS"));
		}
	},
	credentials: true,
	methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
	optionsSuccessStatus: 200,
	allowedHeaders: [
		"Content-Type",
		"Authorization",
		"Access-Control-Allow-Origin",
		"Access-Control-Allow-Credentials",
	],
	exposedHeaders: [
		"Content-Range",
		"X-Content-Range",
		"x-refresh-token",
		"set-cookie",
	],
};

app.use((req: Request, res: Response, next: NextFunction) => {
	req.requestTime = new Date().toISOString();
	next();
});

// Bare health check first — no logger, session, limiter, or parsers.
app.use("/health", (req: Request, res: Response) => {
	res.status(200).json({
		status: "success",
		message: "Server is running",
		environment: env.NODE_ENV,
		timestamp: req.requestTime,
		uptime: process.uptime(),
	});
});

app.use(createExpressLogger()); //Pino HTTP middleware for request logging
app.use(cors(corsOptions));
app.use(helmet(helmetOptions));

// Single-origin production: serve the SPA from this service so session
// cookies never cross a proxy hop (static-site rewrites drop Set-Cookie,
// which breaks login). Dev is unaffected — Vite serves the client there.
// Static sits before session/limiter/parsers: assets need none of them.
let clientDist = "";
if (env.NODE_ENV === "production") {
	clientDist = path.resolve(
		import.meta.dirname,
		"..",
		"..",
		"client",
		"dist",
	);
	app.use(express.static(clientDist));
}

app.use(createSessionMiddleware());

// Rate-limit API traffic only. Static assets, the SPA fallback and health
// checks are exempt — a single page load pulls dozens of assets, and
// counting those trips the limiter and takes the whole site down.
app.use("/v1", globalLimiter);

// Uploads carry multi-MB base64 payloads — parse them before the small
// global limit below (body-parser skips already-parsed requests).
app.use(
	"/v1/upload",
	express.json({ limit: "25mb" }),
	express.urlencoded({ extended: true, limit: "25mb" }),
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
// Compress API JSON + SPA HTML (static assets are compressed at the edge).
app.use(compression(compressionOptions));
app.disable("x-powered-by");

//api routes
app.use("/v1/auth", authRoutes);
app.use("/v1/upload", uploadRoutes);
app.use("/v1/projects", projectRoutes);

// SPA fallback (production only — clientDist is "" otherwise).
if (env.NODE_ENV === "production") {
	app.get("/{*splat}", (req: Request, res: Response, next: NextFunction) => {
		// Unknown API paths still fall through to the JSON 404 handler.
		if (
			req.path.startsWith("/v1") ||
			req.path.startsWith("/health") ||
			req.path.startsWith("/cron-email")
		) {
			return next();
		}
		res.sendFile(path.join(clientDist, "index.html"));
	});
}

// Handle 404
app.use(notFoundRoutes);
// Global error handler
app.use(appErrorHandler);

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3800;

const startServer = async (): Promise<void> => {
	let server: ReturnType<typeof app.listen>;
	try {
		await connectToDB();
		server = app.listen(PORT, "0.0.0.0", () => {
			logger.info(`Server running in ${env.NODE_ENV} mode on port ${PORT}`);
			logger.info(`http://localhost: ${PORT}`);
		});
		//HANDLE unhandled promise rejections
		process.on("unhandledRejection", (reason: unknown) => {
			console.error(`UNHANDLED REJECTION! Shutting down...`);
			const error =
				reason instanceof Error
					? `${reason.name}: ${reason.message}`
					: String(reason);
			logger.error({ reason: error }, "Unhandled rejection");

			//close server gracefully
			server.close(() => {
				logger.info(`Process terminated due to unhandled rejection`);
				logger.info("Server shutdown complete");
			});
		});
		//handle termination signals
		process.on("SIGTERM", gracefulShutdown);
		process.on("SIGINT", gracefulShutdown);

		// Handle any other errors
		server.on("error", (error: NodeJS.ErrnoException) => {
			if (error.syscall !== "listen") throw error;

			switch (error.code) {
				case "EACCES":
					logger.error(`Port ${PORT} requires elevated privileges`);
					process.exit(1);
				case "EADDRINUSE":
					logger.error(`Port ${PORT} is already in use`);
					process.exit(1);
				default:
					throw error;
			}
		});
	} catch (error: unknown) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		logError(` Failed to start server: ${errorMessage}`);
		process.exit(1);
	}
};

startServer();

export default app;
