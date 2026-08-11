import type { ApiSuccessResponse } from "@tsa/shared";
import type { Response } from "express";
import logger from "../config/logger.js";

const sendTsRestResponse = (res: Response, status: number, body: unknown): void => {
  res.status(status).json(body);
};

const sendTsRestSuccess = <T>(res: Response, status: number, data: ApiSuccessResponse<T>): void => {
  sendTsRestResponse(res, status, data);
};

const sendTsRestError = <T>(res: Response, status: number, error: string, details?: T): void => {
  logger.error({ error }, "Error response with message:");
  sendTsRestResponse(res, status, {
    success: false,
    message: error,
    ...(details && { details }),
  });
};

export {
    sendTsRestError,
    sendTsRestResponse,
    sendTsRestSuccess
};
