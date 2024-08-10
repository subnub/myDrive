import { query, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import { middlewareValidationFunction } from "../utils/middleware-utils";

export const moveFileValidationRules = [
  query("fileID").isString().withMessage("Parent must be a string"),
  query("parentID").isString().withMessage("Parent must be a string"),
  middlewareValidationFunction,
];
