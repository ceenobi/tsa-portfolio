import { queryOptions } from "@tanstack/react-query";
import type { GetUserResponse } from "@tsa/shared";
import type { MiddlewareFunction } from "react-router";
import { redirect } from "react-router";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/utils";

export const getSessionQuery = () =>
	queryOptions({
		queryKey: ["session"],
		queryFn: async () => {
			const res = await api.get<GetUserResponse["body"]>("/auth/me");
			return res.body || null;
		},
		staleTime: 60 * 1000,
	});

export const requireAuth: MiddlewareFunction = async ({ request }, next) => {
	const session = await queryClient.fetchQuery(getSessionQuery());
	console.log("ss", session);
	if (!session) {
		const params = new URLSearchParams();
		params.set("redirectTo", new URL(request.url).pathname);
		throw redirect(`/auth/login?${params}`);
	}
	//check role
	if (!["admin", "super_admin"].includes(session.role)) {
		throw redirect("/");
	}
	return await next();
};

export const sessionMiddleware: MiddlewareFunction = async (
	{ request },
	next,
) => {
	try {
		const session = await queryClient.fetchQuery(getSessionQuery());
		console.log("ff", session);
		// // 1. Email Verification Check
		const { pathname } = new URL(request.url);
		if (
			session &&
			!session?.emailVerified &&
			pathname !== "/auth/verify-email"
		) {
			return redirect(`/auth/verify-email?email=${session?.email}`);
		}
		if (session) {
			return session;
		}
	} catch {
		// not authenticated — silently continue
	}
	return await next();
};

export const guestMiddleware: MiddlewareFunction = async (
	{ request },
	next,
) => {
	const { pathname } = new URL(request.url);
	try {
		const session = await queryClient.fetchQuery(getSessionQuery());
		if (pathname === "/auth/verify-email" && !session.emailVerified)
			return await next();
		if (session) {
			const url = new URL(request.url);
			const from = url.searchParams.get("from")
				? url.searchParams.get("from")
				: "/";
			return redirect(from as string);
		}
	} catch {
		// not authenticated — silently continue
	}
	return await next();
};
