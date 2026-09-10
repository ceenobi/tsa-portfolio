import { describe, it, expect } from "vitest";
import {
	registerSchema,
	loginSchema,
	forgotPasswordSchema,
	verifyEmailSchema,
	updateUserRoleSchema,
	USER_ROLES,
} from "@tsa/shared";

const validPassword = "Str0ng!Pass";

describe("registerSchema", () => {
	it("accepts valid input", () => {
		const result = registerSchema.safeParse({
			email: "test@example.com",
			password: validPassword,
		});
		expect(result.success).toBe(true);
	});

	it("rejects invalid email", () => {
		const result = registerSchema.safeParse({
			email: "not-an-email",
			password: validPassword,
		});
		expect(result.success).toBe(false);
	});

	it("rejects password shorter than 8 chars", () => {
		const result = registerSchema.safeParse({
			email: "test@example.com",
			password: "Sh0rt!",
		});
		expect(result.success).toBe(false);
	});

	it("rejects password without uppercase", () => {
		const result = registerSchema.safeParse({
			email: "test@example.com",
			password: "lowercase0!",
		});
		expect(result.success).toBe(false);
	});

	it("rejects password without lowercase", () => {
		const result = registerSchema.safeParse({
			email: "test@example.com",
			password: "UPPERCASE0!",
		});
		expect(result.success).toBe(false);
	});

	it("rejects password without digit", () => {
		const result = registerSchema.safeParse({
			email: "test@example.com",
			password: "NoDigit!Pass",
		});
		expect(result.success).toBe(false);
	});

	it("rejects password without special character", () => {
		const result = registerSchema.safeParse({
			email: "test@example.com",
			password: "NoSpecial0Pass",
		});
		expect(result.success).toBe(false);
	});

	it("rejects missing email", () => {
		const result = registerSchema.safeParse({
			password: validPassword,
		});
		expect(result.success).toBe(false);
	});

	it("rejects missing password", () => {
		const result = registerSchema.safeParse({
			email: "test@example.com",
		});
		expect(result.success).toBe(false);
	});
});

describe("loginSchema", () => {
	it("accepts valid input", () => {
		const result = loginSchema.safeParse({
			email: "test@example.com",
			password: validPassword,
		});
		expect(result.success).toBe(true);
	});

	it("rejects invalid email", () => {
		const result = loginSchema.safeParse({
			email: "bad",
			password: validPassword,
		});
		expect(result.success).toBe(false);
	});

	it("rejects weak password", () => {
		const result = loginSchema.safeParse({
			email: "test@example.com",
			password: "weak",
		});
		expect(result.success).toBe(false);
	});
});

describe("forgotPasswordSchema", () => {
	it("accepts valid email", () => {
		const result = forgotPasswordSchema.safeParse({
			email: "user@example.com",
		});
		expect(result.success).toBe(true);
	});

	it("rejects invalid email", () => {
		const result = forgotPasswordSchema.safeParse({
			email: "not-email",
		});
		expect(result.success).toBe(false);
	});
});

describe("verifyEmailSchema", () => {
	it("accepts 6-digit OTP", () => {
		const result = verifyEmailSchema.safeParse({ otp: "123456" });
		expect(result.success).toBe(true);
	});

	it("rejects OTP shorter than 6 chars", () => {
		const result = verifyEmailSchema.safeParse({ otp: "12345" });
		expect(result.success).toBe(false);
	});

	it("rejects OTP longer than 6 chars", () => {
		const result = verifyEmailSchema.safeParse({ otp: "1234567" });
		expect(result.success).toBe(false);
	});

	it("rejects empty OTP", () => {
		const result = verifyEmailSchema.safeParse({ otp: "" });
		expect(result.success).toBe(false);
	});
});

describe("updateUserRoleSchema", () => {
	it("accepts admin role", () => {
		const result = updateUserRoleSchema.safeParse({ role: "admin" });
		expect(result.success).toBe(true);
	});

	it("accepts super_admin role", () => {
		const result = updateUserRoleSchema.safeParse({ role: "super_admin" });
		expect(result.success).toBe(true);
	});

	it("rejects invalid role", () => {
		const result = updateUserRoleSchema.safeParse({ role: "user" });
		expect(result.success).toBe(false);
	});
});

describe("USER_ROLES constant", () => {
	it("contains exactly admin and super_admin", () => {
		expect(USER_ROLES).toEqual(["admin", "super_admin"]);
	});
});
