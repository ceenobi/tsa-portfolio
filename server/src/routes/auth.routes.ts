import {
	forgotPasswordSchema,
	loginSchema,
	registerSchema,
	resendOtpSchema,
	resetPasswordSchema,
	updateEmailSchema,
	updatePasswordSchema,
	updateUserRoleSchema,
	verifyEmailSchema,
} from "@tsa/shared";
import { Router } from "express";
import {
	forgotPasswordController,
	getUserController,
	listUsersController,
	loginUserController,
	logoutUser,
	registerAccount,
	resendOtpController,
	resetPasswordController,
	updateUserController,
	updateUserRoleController,
	verifyEmailController,
} from "../controllers/auth.controller.js";
import { requireRole, verifySession } from "../middlewares/auth.middleware.js";
import { strictLimiter } from "../middlewares/rateLimit.middleware.js";
import { validateFormData } from "../middlewares/schema.middleware.js";

const router = Router();

router.post(
	"/register",
	strictLimiter,
	validateFormData(registerSchema),
	registerAccount,
);
router.post(
	"/login",
	strictLimiter,
	validateFormData(loginSchema),
	loginUserController,
);
router.post(
	"/forgot-password",
	strictLimiter,
	validateFormData(forgotPasswordSchema),
	forgotPasswordController,
);
router.post(
	"/reset-password",
	strictLimiter,
	validateFormData(resetPasswordSchema),
	resetPasswordController,
);
router.post(
	"/verify-account",
	strictLimiter,
	validateFormData(verifyEmailSchema),
	verifyEmailController,
);
router.post(
	"/resend-otp",
	strictLimiter,
	validateFormData(resendOtpSchema),
	resendOtpController,
);
router.post("/logout", verifySession, logoutUser);

router.get("/me", verifySession, getUserController);

router.patch(
	"/update-email",
	verifySession,
	validateFormData(updateEmailSchema),
	updateUserController,
);
router.patch(
	"/update-password",
	verifySession,
	validateFormData(updatePasswordSchema),
	updateUserController,
);

router.get("/users", verifySession, requireRole("super_admin"), listUsersController);
router.patch(
	"/users/:userId/role",
	verifySession,
	requireRole("super_admin"),
	validateFormData(updateUserRoleSchema),
	updateUserRoleController,
);

export default router;
