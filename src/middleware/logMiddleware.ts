import { type Request, type Response, type NextFunction } from "express";

export const logRequestMethod = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(req.method);
  next();
};
export const logHostname = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(req.hostname);
  next();
};
