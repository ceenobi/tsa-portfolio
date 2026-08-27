import { createBrowserRouter, type RouteObject } from "react-router";
import ErrorBoundary from "@/components/provider/error-boundary";
import SuspenseUi from "@/components/ui/suspense-ui";
import { guestMiddleware, sessionMiddleware } from "@/middleware/auth";
import AuthLayout from "./auth/layout";
import MainLayout from "./main/layout";
import Root from "./root/layout";

const routes = [
	{
		path: "/",
		Component: Root,
		ErrorBoundary,
		hydrateFallbackElement: <SuspenseUi />,
		handle: {
			seo: {
				title: "Techstudio Portfolio",
				description: "See what our students are building.",
			},
		},
		children: [
			{
				Component: MainLayout,
				middleware: [sessionMiddleware],
				children: [
					{
						index: true,
						handle: {
							seo: {
								title: "Home",
								description: "See what our students are building.",
							},
						},
						lazy: async () => {
							const { default: Component } = await import("@/routes/main/home");
							return { Component };
						},
					},
					{
						path: "projects/:slug/:projectId",
						handle: {
							seo: {
								title: "Project",
								description:
									"A student project on the Techstudio Academy portfolio.",
							},
						},
						lazy: async () => {
							const { default: Component } = await import(
								"@/routes/main/project"
							);
							return { Component };
						},
					},
				],
			},
			{
				path: "/auth",
				Component: AuthLayout,
				middleware: [guestMiddleware],
				ErrorBoundary,
				hydrateFallbackElement: <SuspenseUi />,
				children: [
					{
						path: "login",
						handle: {
							seo: {
								title: "Login - Techstudio Academy Portfolio",
								description: "Login to your account.",
							},
						},
						lazy: async () => {
							const { default: Component } = await import(
								"@/routes/auth/login"
							);
							return { Component };
						},
					},
					{
						path: "register",
						handle: {
							seo: {
								title: "Register - Techstudio Academy Portfolio",
								description: "Register for an admin account.",
							},
						},
						lazy: async () => {
							const { default: Component } = await import(
								"@/routes/auth/register"
							);
							return { Component };
						},
					},
					{
						path: "verify-account",
						handle: {
							seo: {
								title: "Verify Account - Techstudio Academy Portfolio",
								description: "Verify your account.",
							},
						},
						lazy: async () => {
							const { default: Component } = await import(
								"@/routes/auth/verify-account"
							);
							return { Component };
						},
					},
					{
						path: "forgot-password",
						handle: {
							seo: {
								title: "Forgot Password - Techstudio Academy Portfolio",
								description: "Forgot your password?",
							},
						},
						lazy: async () => {
							const { default: Component } = await import(
								"@/routes/auth/forgot-password"
							);
							return { Component };
						},
					},
					{
						path: "reset-password",
						handle: {
							seo: {
								title: "Reset Password - Techstudio Academy Portfolio",
								description: "Reset your password.",
							},
						},
						lazy: async () => {
							const { default: Component } = await import(
								"@/routes/auth/reset-password"
							);
							return { Component };
						},
					},
				],
			},
			{
				path: "dashboard",
				handle: {
					seo: {
						title: "Dashboard - Techstudio Academy Portfolio",
						description: "Admin dashboard, manage cohorts portfolios here.",
					},
				},
				lazy: async () => {
					const { default: Component } = await import(
						"@/routes/dashboard/layout"
					);
					return { Component };
				},
				children: [
					{
						index: true,
						lazy: async () => {
							const { default: Component } = await import("@/routes/dashboard");
							return { Component };
						},
					},
					{
						path: "portfolio",
						lazy: async () => {
							const { default: Component } = await import(
								"@/routes/dashboard/portfolio"
							);
							return { Component };
						},
					},
					{
						path: "settings",
						lazy: async () => {
							const { default: Component } = await import(
								"@/routes/dashboard/settings"
							);
							return { Component };
						},
					},
				],
			},
		],
	},
] satisfies RouteObject[];

export const router = createBrowserRouter(routes);