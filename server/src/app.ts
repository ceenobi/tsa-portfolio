import path from "node:path";
import compression from "compression";
import cors from "cors";
import express, {
	type NextFunction,
	type Request,
	type Response,
} from "express";
import helmet from "helmet";
import { env } from "./config/keys.js";
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

const app = express();

// Trust all proxy hops (Cloudflare + Render edge + internal routing).
app.set("trust-proxy", true);

// Global error handlers (process-level)
setupGlobalErrorHandlers();

// Cron email route (before other middleware)
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

app.use(createExpressLogger());
app.use(cors(corsOptions));
app.use(helmet(helmetOptions));

// Serve SPA in production
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

// Rate-limit API traffic only
app.use("/v1", globalLimiter);

// Uploads carry multi-MB base64 payloads
app.use(
	"/v1/upload",
	express.json({ limit: "25mb" }),
	express.urlencoded({ extended: true, limit: "25mb" }),
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(compression(compressionOptions));
app.disable("x-powered-by");

// API routes
app.use("/v1/auth", authRoutes);
app.use("/v1/upload", uploadRoutes);
app.use("/v1/projects", projectRoutes);

// SPA fallback (production only)
if (env.NODE_ENV === "production") {
	app.get("/{*splat}", (req: Request, res: Response, next: NextFunction) => {
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

export default app;
