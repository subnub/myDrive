import { body, param, query, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import { middlewareValidationFunction } from "../utils/middleware-utils";

export const moveFolderListValidationRules = [
  query("parent").optional().isString().withMessage("Parent must be a string"),
  query("search").optional().isString().withMessage("Search must be a string"),
  middlewareValidationFunction,
];

export const getFolderInfoValidationRules = [
  param("id").isString().withMessage("ID must be a string"),
  middlewareValidationFunction,
];

const getFolderListValidationRules = [
  query("search").optional().isString().withMessage("Search must be a string"),
  query("parent").optional().isString().withMessage("Parent must be a string"),
  query("sortBy").optional().isString().withMessage("Sort By must be a string"),
  query("type").optional().isString().withMessage("Type must be a string"),
];
