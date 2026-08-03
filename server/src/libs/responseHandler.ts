import type { Response } from "express";
import logger from "../config/logger.js";

export type ApiSuccessResponse<TBody = undefined> = {
  success: true
  message: string
} & (TBody extends undefined ? {} : { body: TBody })

export type ApiErrorResponse<TDetails = undefined> = {
  success: false
  message: string
} & (TDetails extends undefined ? {} : { details: TDetails })

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
  sendTsRestResponse,
  sendTsRestSuccess,
  sendTsRestError,
};