import { body, param, query, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import { middlewareValidationFunction } from "../utils/middleware-utils";

// GET

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
  query("mediaFilter")
    .optional()
    .isString()
    .withMessage("Media Filter must be a string"),
  query("mediaMode")
    .optional()
    .isBoolean()
    .withMessage("Media Mode must be a boolean"),
  query("sortBy").optional().isString().withMessage("Sort By must be a string"),
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

export const streamVideoValidationRules = [
  param("id").isString().withMessage("ID must be a string"),
  middlewareValidationFunction,
];

export const downloadFileValidationRules = [
  param("id").isString().withMessage("ID must be a string"),
  middlewareValidationFunction,
];

// PATCH

export const renameFileValidationRules = [
  body("id").isString().withMessage("ID must be a string"),
  body("title")
    .exists()
    .withMessage("Title is required")
    .isString()
    .withMessage("Title must be a string")
    .isLength({ min: 1, max: 256 })
    .withMessage(
      "Title must be at least 1 character and at most 256 characters"
    ),
  middlewareValidationFunction,
];

export const moveFileValidationRules = [
  body("id").isString().withMessage("FileID must be a string"),
  body("parentID").isString().optional().withMessage("Parent must be a string"),
  middlewareValidationFunction,
];

export const moveMultiValidationRules = [
  body("items").isArray().withMessage("Items must be an array"),
  body("parentID").isString().optional().withMessage("Parent must be a string"),
  middlewareValidationFunction,
];

export const trashFileValidationRules = [
  body("id").isString().withMessage("ID must be a string"),
  middlewareValidationFunction,
];

export const trashMultiValidationRules = [
  body("items").isArray().withMessage("Items must be an array"),
  middlewareValidationFunction,
];

export const restoreFileValidationRules = [
  body("id").isString().withMessage("ID must be a string"),
  middlewareValidationFunction,
];

export const restoreMultiValidationRules = [
  body("items").isArray().withMessage("Items must be an array"),
  middlewareValidationFunction,
];

export const makePublicValidationRules = [
  param("id").isString().withMessage("ID must be a string"),
  middlewareValidationFunction,
];

export const makePrivateValidationRules = [
  param("id").isString().withMessage("ID must be a string"),
  middlewareValidationFunction,
];

export const removeVideoStreamTokenValidationRules = [
  param("id").isString().withMessage("ID must be a string"),
  middlewareValidationFunction,
];

// DELETE

export const deleteFileValidationRules = [
  body("id").isString().withMessage("ID must be a string"),
  middlewareValidationFunction,
];

export const deleteMultiValidationRules = [
  body("items").isArray().withMessage("Items must be an array"),
  middlewareValidationFunction,
];
