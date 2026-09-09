import type { Request, Response } from "express";
import { startEmailCron } from "../jobs/emailCron.js";
import { sendTsRestSuccess } from "../libs/responseHandler.js";
import tryCatchWrapper from "../libs/tryCatchWrapper.js";

export const checkEmailCron = tryCatchWrapper(
	async (req: Request, res: Response) => {
		// Secret is verified by verifyCronSecret on the route.
		const result = await startEmailCron();

		return sendTsRestSuccess(res, 200, {
			success: true,
			message: "Email cron job completed",
			body: result,
		});
	},
);
