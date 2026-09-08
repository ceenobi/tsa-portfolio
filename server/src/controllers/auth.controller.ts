import type {
	AuthResponse,
	ForgotPasswordResponse,
	GetUserResponse,
	ListUsersResponse,
	LogoutResponse,
	ResendOtpResponse,
	ResetPasswordResponse,
	VerifyEmailResponse,
} from "@tsa/shared";
import type { Request, Response } from "express";
import { sendTsRestError, sendTsRestSuccess } from "../libs/responseHandler.js";
import tryCatchWrapper from "../libs/tryCatchWrapper.js";
import {
	forgotPassword,
	getUser,
	listUsers,
	loginUser,
	registerUser,
	resendOtp,
	resetPassword,
	updateUserRole,
	updateUser,
	verifyEmail,
} from "../services/authService.js";

export const registerAccount = tryCatchWrapper(
	async (req: Request, res: Response) => {
		const result = await registerUser(req.body);
		if (!result.success) {
			return sendTsRestError(res, result.status, result.message);
		}

		req.session.userId = result.user.id;
		req.session.role = result.user.role;

		return sendTsRestSuccess<AuthResponse["body"]>(res, 201, {
			success: true,
			message:
				"Account created. Please check your email to verify your account.",
			body: {
				user: {
					email: result.user.email,
					emailVerified: result.user.emailVerified,
				},
			},
		});
	},
);

export const loginUserController = tryCatchWrapper(
	async (req: Request, res: Response) => {
		const result = await loginUser(req.body);
		if (!result.success) {
			return sendTsRestError(res, result.status, result.message);
		}

		req.session.userId = result.user.id;
		req.session.role = result.user.role;

		return sendTsRestSuccess<AuthResponse["body"]>(res, 200, {
			success: true,
			message: "Login successful",
			body: {
				user: {
					email: result.user.email,
					emailVerified: result.user.emailVerified,
				},
			},
		});
	},
);

export const forgotPasswordController = tryCatchWrapper(
	async (req: Request, res: Response) => {
		const result = await forgotPassword(req.body);
		if (!result.success) {
			return sendTsRestError(res, result.status, result.message);
		}

		return sendTsRestSuccess<ForgotPasswordResponse["body"]>(res, 200, {
			success: true,
			message: result.message,
			body: { message: "Check your email for the reset link." },
		});
	},
);

export const resetPasswordController = tryCatchWrapper(
	async (req: Request, res: Response) => {
		const token =
			typeof req.query.token === "string" ? req.query.token : "";
		const result = await resetPassword({ password: req.body.password, token });
		if (!result.success) {
			return sendTsRestError(res, result.status, result.message);
		}

		return sendTsRestSuccess<ResetPasswordResponse["body"]>(res, 200, {
			success: true,
			message: result.message,
			body: { message: "Password updated." },
		});
	},
);

export const verifyEmailController = tryCatchWrapper(
	async (req: Request, res: Response) => {
		const email =
			typeof req.query.email === "string" ? req.query.email : "";
		const result = await verifyEmail({ email, otp: req.body.otp });
		if (!result.success) {
			return sendTsRestError(res, result.status, result.message);
		}

		return sendTsRestSuccess<VerifyEmailResponse["body"]>(res, 200, {
			success: true,
			message: result.message,
			body: { message: "You can now log in." },
		});
	},
);

export const resendOtpController = tryCatchWrapper(
	async (req: Request, res: Response) => {
		const result = await resendOtp(req.body);
		if (!result.success) {
			return sendTsRestError(res, result.status, result.message);
		}

		return sendTsRestSuccess<ResendOtpResponse["body"]>(res, 200, {
			success: true,
			message: result.message,
			body: { message: "Check your email for the verification code." },
		});
	},
);

export const getUserController = tryCatchWrapper(
	async (req: Request, res: Response) => {
		const result = await getUser(req.session.userId);
		if (!result.success) {
			return sendTsRestError(res, result.status, result.message);
		}

		return sendTsRestSuccess<GetUserResponse["body"]>(res, 200, {
			success: true,
			message: "User found",
			body: result.user,
		});
	},
);

export const logoutUser = tryCatchWrapper(
	async (req: Request, res: Response) => {
		req.session.destroy((err) => {
			if (err) {
				return sendTsRestError(res, 500, "Failed to logout");
			}
			res.clearCookie("_tsaPortfolio");
			return sendTsRestSuccess<LogoutResponse["body"]>(res, 200, {
				success: true,
				message: "Logout successful",
				body: { message: "Logout successful." },
			});
		});
	},
);

//update user email or password
export const updateUserController = tryCatchWrapper(
	async (req: Request, res: Response) => {
		const userId = req.session?.userId;
		if (!userId) {
			return sendTsRestError(res, 401, "Access denied. Please log in.");
		}

		const result = await updateUser(userId, req.body);
		if (!result.success) {
			return sendTsRestError(res, result.status, result.message);
		}

		// Destroy session after successful update — user must re-authenticate.
		req.session.destroy((err) => {
			if (err) {
				return sendTsRestError(res, 500, "Account updated but failed to log out. Please log in again.");
			}
			res.clearCookie("_tsaPortfolio");
			return sendTsRestSuccess<undefined>(res, 200, {
				success: true,
				message: result.message,
			});
		});
	},
);

export const listUsersController = tryCatchWrapper(
	async (req: Request, res: Response) => {
		const result = await listUsers();
		if (!result.success) {
			return sendTsRestError(res, result.status, result.message);
		}

		return sendTsRestSuccess<ListUsersResponse["body"]>(res, 200, {
			success: true,
			message: "Users fetched successfully",
			body: result.users,
		});
	},
);

export const updateUserRoleController = tryCatchWrapper(
	async (req: Request, res: Response) => {
		const requesterId = req.session?.userId;
		if (!requesterId) {
			return sendTsRestError(res, 401, "Access denied. Please log in.");
		}

		const userId = req.params.userId as string;
		const { role } = req.body;

		const result = await updateUserRole(userId, role, requesterId);
		if (!result.success) {
			return sendTsRestError(res, result.status, result.message);
		}

		return sendTsRestSuccess(res, 200, {
			success: true,
			message: result.message,
			body: result.user,
		});
	},
);
