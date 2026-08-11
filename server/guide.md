# Auth Controller — Feature Implementation Guide

> Scope: This guide covers the **auth module only**. The server also contains an email module (`src/controllers/email.controller.ts`, `src/routes/email.routes.ts`) that exposes `GET /api/cron-email` for the Vercel cron job that drains the email queue (`src/jobs/emailCron.ts`).

**Mount point:** auth routes are mounted at `/api/v1/auth` in `src/index.ts` (`app.use('/api/v1/auth', authRoutes)`).

All controllers are wrapped in `tryCatchWrapper` from `src/libs/tryCatchWrapper.ts` and use `sendTsRestSuccess` / `sendTsRestError` from `src/libs/responseHandler.ts`.

---

## Route: `POST /api/v1/auth/register`

**Controller:** `registerAccount`
**Middleware:** `strictLimiter` → `validateFormData(registerSchema)`

### Request Body

```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

### Implementation Steps

1. **Check for existing user** — Query `User.findOne({ email }).lean()`. If found, return `409 "An account with this email already exists"`.
2. **Hash password** — `bcrypt.genSalt(10)` then `bcrypt.hash(password, salt)`.
3. **Generate OTP** — `generateOTP()` (6-digit random), `getOtpExpiry()` (15 min from now).
4. **Create user** — `User.create({ email: email.toLowerCase(), password: hashedPassword, role: 'admin', otp: { code: otp, expiresAt: otpExpiry, attempts: 0 }, otpLastSentAt: new Date() })`.
5. **Send verification email** — `EmailService.sendVerifyAccountEmail({ user, otp, link })` where `link = "${env.CLIENT_URL}/auth/verify-email?email=${encodeURIComponent(user.email)}"`. If Brevo fails, email is queued for retry via the email cron job.
6. **Set session** — `req.session.userId = user._id.toString()`, `req.session.role = user.role`.
7. **Respond** — `201` with `{ success: true, message: "Account created. Please check your email to verify your account.", body: { user: { email, emailVerified } } }`.

### Notes

- Password validation is handled by `registerSchema` (Zod): min 8 chars, at least one uppercase, one lowercase, one digit, one special character.
- Email is lowercased before storage.
- New users are created with `role: 'admin'` (the `User` model only supports `'admin' | 'super_admin'`).

---

## Route: `POST /api/v1/auth/login`

**Controller:** `loginUser`
**Middleware:** `strictLimiter` → `validateFormData(loginSchema)`

### Request Body

```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

### Implementation Steps

1. **Find user** — `User.findOne({ email }).select('+password')` (password is `select: false` by default).
2. **Not found** → `400 "Account not found"`.
3. **Check lockout** — If `user.lockoutUntil > new Date()`, return `403 "Account locked. Try again in X minute(s)."`. If `lockoutUntil` has expired, auto-clear it and reset `failedLoginAttempts`.
4. **Compare password** — `bcrypt.compare(password, user.password)`.
5. **Wrong password** — Increment `failedLoginAttempts`. If `>= 5`, set `lockoutUntil = now + 30 min`, reset counter, save, return `403 "Account locked due to too many failed attempts. Try again in 30 minutes."`. Otherwise, save and return `401 "Incorrect credentials"`.
6. **Correct password** — Reset `failedLoginAttempts = 0`, set `lastLoginAt = new Date()`, save. Set `req.session.userId` and `req.session.role`.
7. **Respond** — `200` with `{ success: true, message: "Login successful", body: { user: { email, emailVerified } } }`.

### Notes

- Lockout is timed (30 min), not permanent. Auto-clears after expiry.
- Failed-attempts tracking uses the Mongoose document (not `lean()`), so `.save()` propagates changes atomically.
- There is currently **no `emailVerified` check** on login.

---

## Route: `POST /api/v1/auth/verify-account`

**Controller:** `verifyEmail`
**Middleware:** `strictLimiter` → `validateFormData(verifyEmailSchema)`

### Request — email is a **query param**, OTP is in the body

```
POST /api/v1/auth/verify-account?email=john@example.com
```

```json
{
  "otp": "123456"
}
```

### Implementation Steps

1. **Email query param** — If `req.query.email` is missing, return `400 "Email query params is missing."`.
2. **Find user** — `User.findOne({ email })`. Not found → `400 "Invalid account request."`.
3. **Already verified** → `400 "Email is already verified."`.
4. **No OTP** — If `!user.otp?.code || !user.otp?.expiresAt`, return `400 "No OTP found. Request a new one."`.
5. **Expired OTP** — If `user.otp.expiresAt < new Date()`, return `400 "OTP has expired. Request a new one."`.
6. **Max attempts** — If `user.otp.attempts >= 5`, return `400 "Too many failed attempts. Request a new OTP."`.
7. **Wrong code** — Increment `user.otp.attempts`, save. Return `400 "Invalid OTP. X attempt(s) remaining."`.
8. **Correct code** — Set `user.emailVerified = true`, clear `user.otp = undefined`, `user.otpLastSentAt = undefined`, save.
9. **Respond** — `200` with `{ success: true, message: "Email verified successfully.", body: { message: "You can now log in." } }`.

---

## Route: `POST /api/v1/auth/resend-otp`

**Controller:** `resendOtp`
**Middleware:** `strictLimiter` → `validateFormData(resendOtpSchema)`

### Request Body

```json
{
  "email": "john@example.com"
}
```

### Implementation Steps

1. **Find user** — Not found → `400 "Account not found."`.
2. **Already verified** → `400 "Email is already verified."`.
3. **Current OTP still valid** — If `user.otp?.expiresAt > new Date()`, return `400 "Current OTP is still valid. Try again in X minute(s)."`.
4. **Generate new OTP** — `generateOTP()` + `getOtpExpiry()`. Set `user.otp = { code: otp, expiresAt: otpExpiry, attempts: 0 }`, `user.otpLastSentAt = new Date()`, save.
5. **Send email** — `EmailService.sendVerifyAccountEmail({ user, otp, link })` with the same verification link format as register.
6. **Respond** — `200` with `{ success: true, message: "A new OTP has been sent to your email.", body: { message: "Check your email for the verification code." } }`.

---

## Route: `POST /api/v1/auth/forgot-password`

**Controller:** `forgotPassword`
**Middleware:** `strictLimiter` → `validateFormData(forgotPasswordSchema)`

### Request Body

```json
{
  "email": "john@example.com"
}
```

### Implementation Steps

1. **Find user** — If not found, still return `200` with a generic message (prevents email enumeration).
2. **Generate token** — `generateResetToken()` returns `crypto.randomBytes(32).toString('hex')`.
3. **Hash token** — `hashToken(resetToken)` returns `crypto.createHash('sha256').update(token).digest('hex')`.
4. **Store** — `user.resetPasswordToken = hashedToken`, `user.resetPasswordExpiresAt = getTokenExpiry(15)` (15 min), save.
5. **Send email** — `EmailService.sendPasswordResetEmail({ user, resetLink })` where `resetLink = "${env.CLIENT_URL}/auth/reset-password?token=${resetToken}"`.
6. **Respond** — `200` with `{ success: true, message: "If an account with this email exists, a password reset link has been sent.", body: { message: "Check your email for the reset link." } }` (identical response whether or not the account exists).

### Notes

- Raw token is sent in the email link (not the hash). The hash is stored in the DB.
- Same response regardless of whether the email exists (security best practice).

---

## Route: `POST /api/v1/auth/reset-password`

**Controller:** `resetPassword`
**Middleware:** `strictLimiter` → `validateFormData(resetPasswordSchema)`

### Request — token is a **query param**, password is in the body

```
POST /api/v1/auth/reset-password?token=<token_from_email>
```

```json
{
  "password": "NewSecurePass123!"
}
```

### Implementation Steps

1. **Token present** — If `req.query.token` is missing, return `400 "No token provided."`.
2. **Hash incoming token** — `hashToken(token)`.
3. **Find user** — `User.findOne({ resetPasswordToken: hashedToken, resetPasswordExpiresAt: { $gt: new Date() } }).select('+password')`.
4. **Invalid/expired** → `400 "Invalid account or expired reset token."`.
5. **Hash new password** — `bcrypt.genSalt(10)` + `bcrypt.hash(password, salt)`.
6. **Update user** — Set `password = hashedPassword`, clear `resetPasswordToken` and `resetPasswordExpiresAt`, reset `failedLoginAttempts = 0` and `lockoutUntil = undefined`, set `passwordChangedAt = new Date()`, save.
7. **Respond** — `200` with `{ success: true, message: "Password reset successful. You can now log in with your new password.", body: { message: "Password updated." } }`.

---

## Route: `GET /api/v1/auth/me`

**Controller:** `getUser`
**Middleware:** `verifySession`

### Implementation Steps

1. **Requires session** — If no `req.session.userId`, `verifySession` returns `401 "Access denied. Please log in."`.
2. **Find user** — `User.findById(req.session.userId).lean()`.
3. **Not found** → `404 "User not found"`.
4. **Respond** — `200` with `{ success: true, message: "User found", body: user }` (full user document).

---

## Route: `POST /api/v1/auth/logout`

**Controller:** `logoutUser`
**Middleware:** `verifySession`

### Implementation Steps

1. **Destroy session** — `req.session.destroy(callback)`.
2. **Error** → `500 "Failed to logout"`.
3. **Success** → Clear the `_tsaPortfolio` cookie, then respond `200` with `{ success: true, message: "Logout successful", body: { message: "Logout successful." } }`.

---

## Key Utilities

| Function                              | File                           | Purpose                                                           |
| ------------------------------------- | ------------------------------ | ----------------------------------------------------------------- |
| `generateOTP()`                       | `src/libs/utils.ts`            | Returns 6-digit random string                                     |
| `getOtpExpiry()`                      | `src/libs/utils.ts`            | Returns `Date` 15 min from now                                    |
| `generateResetToken()`                | `src/libs/utils.ts`            | Returns `crypto.randomBytes(32).toString('hex')`                  |
| `hashToken(token)`                    | `src/libs/utils.ts`            | Returns `crypto.createHash('sha256').update(token).digest('hex')` |
| `getTokenExpiry(min)`                 | `src/libs/utils.ts`            | Returns `Date` N min from now (default 15)                        |
| `EmailService.sendVerifyAccountEmail` | `src/services/emailService.ts` | Sends OTP verification email via Brevo, queues on failure         |
| `EmailService.sendPasswordResetEmail` | `src/services/emailService.ts` | Sends password reset email via Brevo, queues on failure           |

---

## Middleware Reference

| Middleware                 | File                                      | Purpose                                                                                 |
| -------------------------- | ----------------------------------------- | --------------------------------------------------------------------------------------- |
| `strictLimiter`            | `src/middlewares/rateLimit.middleware.ts` | 10 requests per 15 minutes (keyed by session or IP)                                     |
| `globalLimiter`            | `src/middlewares/rateLimit.middleware.ts` | 100 requests per 15 minutes, applied to the whole app                                   |
| `validateFormData(schema)` | `src/middlewares/schema.middleware.ts`    | Parses `req.body` against a Zod schema; on failure returns `400` with Zod issue details |
| `verifySession`            | `src/middlewares/auth.middleware.ts`      | Requires `req.session.userId`, else `401`                                               |

---

## Error Response Format

All errors follow: `{ success: false, message: string, details?: any }`

Success responses follow: `{ success: true, message: string, body?: any }`

Response types are defined in `src/types.d.ts` (e.g., `AuthResponse`, `ForgotPasswordResponse`) using `ApiSuccessResponse<T>` from `src/libs/responseHandler.ts`.

---

## Session Notes

- Sessions are stored in MongoDB via `connect-mongo` (`sessions` collection, TTL cleanup), cookie name `_tsaPortfolio`.
- `req.session.userId` and `req.session.role` are the only session values set by the auth module. The `role` type is `'admin' | 'super_admin'` (declared in `src/index.ts`).
