import type { UserRole } from "@tsa/shared";

// Single home for our session fields.
//
// Previously this lived in index.ts and — worse — the base Request.session
// typing only reached files transitively through config/session.ts's
// import. Extending SessionData here keeps userId/role visible to every
// file in the program through one explicit, documented location (this file
// is included via tsconfig's src glob; all imports are type-only so it
// emits nothing at runtime).
declare module "express-session" {
	interface SessionData {
		userId?: string;
		role?: UserRole;
	}
}

export {};
