import { query, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import { middlewareValidationFunction } from "../utils/middleware-utils";

export const moveFolderListValidationRules = [
  query("parent").optional().isString().withMessage("Parent must be a string"),
  query("search").optional().isString().withMessage("Search must be a string"),
  middlewareValidationFunction,
];
