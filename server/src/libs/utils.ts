import crypto from "node:crypto";

export const generateOTP = (): string => {
	return Math.floor(100000 + Math.random() * 900000).toString();
};

// Calculate OTP expiry (15 minutes from now)
export const getOtpExpiry = (): Date => {
	return new Date(Date.now() + 15 * 60 * 1000);
};

// Generate a cryptographically secure reset token
export const generateResetToken = (): string => {
	return crypto.randomBytes(32).toString("hex");
};

// Hash a reset token for secure storage
export const hashToken = (token: string): string => {
	return crypto.createHash("sha256").update(token).digest("hex");
};

// Calculate token expiry (default 15 minutes from now)
export const getTokenExpiry = (minutes: number = 15): Date => {
	return new Date(Date.now() + minutes * 60 * 1000);
};
