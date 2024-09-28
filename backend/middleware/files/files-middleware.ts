import { param, query, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import { middlewareValidationFunction } from "../utils/middleware-utils";

export const getThumbnailValidationRules = [
  param("id").isString().withMessage("ID must be a string"),
  middlewareValidationFunction,
];

export const getPublicDownloadValidationRules = [
  param("id").isString().withMessage("ID must be a string"),
  param("tempToken").isString().withMessage("Temp Token must be a string"),
  middlewareValidationFunction,
];

export const getFileInfoValidationRules = [
  param("id").isString().withMessage("ID must be a string"),
  middlewareValidationFunction,
];

export const getQuickListValidationRules = [
  query("limit").optional().isNumeric().withMessage("Limit must be a number"),
  middlewareValidationFunction,
];

export const getListValidationRules = [
  query("search").optional().isString().withMessage("Search must be a string"),
  query("parent").optional().isString().withMessage("Parent must be a string"),
  query("startAtDate")
    .optional()
    .isString()
    .withMessage("Start At Date must be a string"),
  query("startAtName")
    .optional()
    .isString()
    .withMessage("Start At Name must be a string"),
  query("trashMode")
    .optional()
    .isBoolean()
    .withMessage("Trash Mode must be a boolean"),
  query("mediaMode")
    .optional()
    .isBoolean()
    .withMessage("Media Mode must be a boolean"),
  query("sortBy").optional().isString().withMessage("Sort By must be a string"),
  middlewareValidationFunction,
];

export const moveFileValidationRules = [
  query("fileID").isString().withMessage("Parent must be a string"),
  query("parentID").isString().withMessage("Parent must be a string"),
  middlewareValidationFunction,
];

export const getSuggestedListValidationRules = [
  query("search")
    .optional()
    .isString()
    .isLength({ min: 1, max: 255 })
    .withMessage("Search must be a string"),
  query("trashMode")
    .optional()
    .isBoolean()
    .withMessage("Trash Mode must be a boolean"),
  query("mediaMode")
    .optional()
    .isBoolean()
    .withMessage("Media Mode must be a boolean"),
  middlewareValidationFunction,
];
