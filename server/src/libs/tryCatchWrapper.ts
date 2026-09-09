import { NextFunction, Request, Response } from "express";

type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => unknown | Promise<unknown>;

const tryCatchWrapper = (fn: AsyncHandler) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

export default tryCatchWrapper;