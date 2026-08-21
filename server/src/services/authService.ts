import type { UserProfile } from "@tsa/shared";
import bcrypt from "bcrypt";
import { env } from "../config/keys.js";
import logger from "../config/logger.js";
import {
	generateOTP,
	generateResetToken,
	getOtpExpiry,
	getTokenExpiry,
	hashToken,
} from "../libs/utils.js";
import User from "../models/user.js";
import { EmailService } from "./emailService.js";

type ServiceError = { success: false; status: number; message: string };

type SessionUser = {
	id: string;
	role: "admin" | "super_admin";
	email: string;
	emailVerified: boolean;
};

type RegisterUserResult =
	| { success: true; user: SessionUser }
	| ServiceError;

type LoginUserResult = RegisterUserResult;

type UserResult = { success: true; user: UserProfile } | ServiceError;

type MessageResult = { success: true; message: string } | ServiceError;

export const registerUser = async (data: {
	email: string;
	password: string;
}): Promise<RegisterUserResult> => {
	const { email, password } = data;
	const existingUser = await User.findOne({ email }).lean();
	if (existingUser) {
		return {
			success: false,
			status: 409,
			message: "An account with this email already exists",
		};
	}

	const salt = await bcrypt.genSalt(10);
	const hashedPassword = await bcrypt.hash(password, salt);

	const otp = generateOTP();
	const otpExpiry = getOtpExpiry();

	const user = await User.create({
		email: email.toLowerCase(),
		password: hashedPassword,
		role: "admin",
		otp: { code: otp, expiresAt: otpExpiry, attempts: 0 },
		otpLastSentAt: new Date(),
	});

	const verificationLink = `${env.CLIENT_URL}/auth/verify-account?email=${encodeURIComponent(user.email)}`;
	await EmailService.sendVerifyAccountEmail({
		user,
		otp,
		link: verificationLink,
	});

	logger.info({ userId: user._id }, "New account registered");

	return {
		success: true,
		user: {
			id: user._id.toString(),
			role: user.role,
			email: user.email,
			emailVerified: user.emailVerified,
		},
	};
};

export const loginUser = async (data: {
	email: string;
	password: string;
}): Promise<LoginUserResult> => {
	const { email, password } = data;

	const user = await User.findOne({ email }).select("+password");
	if (!user) {
		return { success: false, status: 400, message: "Account not found" };
	}

	if (user.lockoutUntil && user.lockoutUntil > new Date()) {
		const minutesRemaining = Math.ceil(
			(user.lockoutUntil.getTime() - Date.now()) / 60000,
		);
		return {
			success: false,
			status: 403,
			message: `Account locked. Try again in ${minutesRemaining} minute(s).`,
		};
	}

	if (user.lockoutUntil && user.lockoutUntil <= new Date()) {
		user.lockoutUntil = undefined;
		user.failedLoginAttempts = 0;
	}

	const isPasswordCorrect = await bcrypt.compare(password, user.password);
	if (!isPasswordCorrect) {
		user.failedLoginAttempts += 1;

		if (user.failedLoginAttempts >= 5) {
			user.lockoutUntil = new Date(Date.now() + 30 * 60 * 1000);
			user.failedLoginAttempts = 0;
			await user.save();
			return {
				success: false,
				status: 403,
				message:
					"Account locked due to too many failed attempts. Try again in 30 minutes.",
			};
		}

		await user.save();
		return { success: false, status: 401, message: "Incorrect credentials" };
	}

	user.failedLoginAttempts = 0;
	user.lastLoginAt = new Date();
	await user.save();

	return {
		success: true,
		user: {
			id: user._id.toString(),
			role: user.role,
			email: user.email,
			emailVerified: user.emailVerified,
		},
	};
};

export const forgotPassword = async (data: {
	email: string;
}): Promise<MessageResult> => {
	const { email } = data;

	const user = await User.findOne({ email });
	if (!user) {
		return {
			success: true,
			message:
				"If an account with this email exists, a password reset link has been sent.",
		};
	}

	const resetToken = generateResetToken();
	const hashedToken = hashToken(resetToken);

	user.resetPasswordToken = hashedToken;
	user.resetPasswordExpiresAt = getTokenExpiry(15);
	await user.save();

	const resetLink = `${env.CLIENT_URL}/auth/reset-password?token=${resetToken}`;
	await EmailService.sendPasswordResetEmail({ user, resetLink });

	logger.info({ userId: user._id }, "Password reset email sent");

	return {
		success: true,
		message:
			"If an account with this email exists, a password reset link has been sent.",
	};
};

export const resetPassword = async (data: {
	password: string;
	token: string;
}): Promise<MessageResult> => {
	const { password, token } = data;

	if (!token) {
		return { success: false, status: 400, message: "No token provided." };
	}

	const hashedToken = hashToken(token);
	const user = await User.findOne({
		resetPasswordToken: hashedToken,
		resetPasswordExpiresAt: { $gt: new Date() },
	}).select("+password");

	if (!user) {
		return {
			success: false,
			status: 400,
			message: "Invalid account or expired reset token.",
		};
	}

	const salt = await bcrypt.genSalt(10);
	const hashedPassword = await bcrypt.hash(password, salt);

	user.password = hashedPassword;
	user.resetPasswordToken = undefined;
	user.resetPasswordExpiresAt = undefined;
	user.failedLoginAttempts = 0;
	user.lockoutUntil = undefined;
	user.passwordChangedAt = new Date();
	await user.save();

	logger.info({ userId: user._id }, "Password reset successful");

	return {
		success: true,
		message:
			"Password reset successful. You can now log in with your new password.",
	};
};

export const verifyEmail = async (data: {
	email: string;
	otp: string;
}): Promise<MessageResult> => {
	const { email, otp } = data;

	if (!email) {
		return {
			success: false,
			status: 400,
			message: "Email query params is missing.",
		};
	}

	const user = await User.findOne({ email });
	if (!user) {
		return { success: false, status: 400, message: "Invalid account request." };
	}

	if (user.emailVerified) {
		return { success: false, status: 400, message: "Email is already verified." };
	}

	if (!user.otp?.code || !user.otp?.expiresAt) {
		return {
			success: false,
			status: 400,
			message: "No OTP found. Request a new one.",
		};
	}

	if (user.otp.expiresAt < new Date()) {
		return {
			success: false,
			status: 400,
			message: "OTP has expired. Request a new one.",
		};
	}

	if (user.otp.attempts >= 5) {
		return {
			success: false,
			status: 400,
			message: "Too many failed attempts. Request a new OTP.",
		};
	}

	if (user.otp.code !== otp) {
		user.otp.attempts += 1;
		await user.save();

		const remaining = 5 - user.otp.attempts;
		return {
			success: false,
			status: 400,
			message: `Invalid OTP. ${remaining} attempt(s) remaining.`,
		};
	}

	user.emailVerified = true;
	user.otp = undefined;
	user.otpLastSentAt = undefined;
	await user.save();

	logger.info({ userId: user._id }, "Email verified successfully");

	return { success: true, message: "Email verified successfully." };
};

export const resendOtp = async (data: {
	email: string;
}): Promise<MessageResult> => {
	const { email } = data;

	const user = await User.findOne({ email });
	if (!user) {
		return { success: false, status: 400, message: "Account not found." };
	}

	if (user.emailVerified) {
		return { success: false, status: 400, message: "Email is already verified." };
	}

	if (user.otp?.expiresAt && user.otp.expiresAt > new Date()) {
		const remainingMinutes = Math.ceil(
			(user.otp.expiresAt.getTime() - Date.now()) / 60000,
		);
		return {
			success: false,
			status: 400,
			message: `Current OTP is still valid. Try again in ${remainingMinutes} minute(s).`,
		};
	}

	const otp = generateOTP();
	const otpExpiry = getOtpExpiry();

	user.otp = { code: otp, expiresAt: otpExpiry, attempts: 0 };
	user.otpLastSentAt = new Date();
	await user.save();

	const verificationLink = `${env.CLIENT_URL}/auth/verify-account?email=${encodeURIComponent(user.email)}`;
	await EmailService.sendVerifyAccountEmail({
		user,
		otp,
		link: verificationLink,
	});

	logger.info({ userId: user._id }, "New OTP sent");

	return { success: true, message: "A new OTP has been sent to your email." };
};

export const getUser = async (
	userId: string | undefined,
): Promise<UserResult> => {
	const user = await User.findById(userId).lean();
	if (!user) {
		return { success: false, status: 404, message: "User not found" };
	}
	return { success: true, user: user as unknown as UserProfile };
};