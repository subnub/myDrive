import e, { NextFunction } from "express";
import { validationResult } from "express-validator";
import { Request, Response } from "express";
import NotAuthorizedError from "../../utils/NotAuthorizedError";
import NotFoundError from "../../utils/NotFoundError";
import InternalServerError from "../../utils/InternalServerError";
import ForbiddenError from "../../utils/ForbiddenError";
import NotValidDataError from "../../utils/NotValidDataError";
import ConflictError from "../../utils/ConflictError";

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

export const middlewareErrorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.log("Express route error: ", error);

  if (
    error instanceof NotAuthorizedError ||
    error instanceof ForbiddenError ||
    error instanceof NotFoundError ||
    error instanceof InternalServerError ||
    error instanceof NotValidDataError ||
    error instanceof ConflictError
  ) {
    return res.status(error.code).send(error.message);
  }

  res.status(500).send("Server error");
};
