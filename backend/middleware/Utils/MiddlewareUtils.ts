import { NextFunction } from "express";
import { validationResult } from "express-validator";
import { Request, Response } from "express";

export const middlewareValidationFunction = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
