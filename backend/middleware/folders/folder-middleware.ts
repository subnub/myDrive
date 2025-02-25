import { body, param, query, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import { middlewareValidationFunction } from "../utils/middleware-utils";

// GET

export const moveFolderListValidationRules = [
  query("parent").optional().isString().withMessage("Parent must be a string"),
  query("search").optional().isString().withMessage("Search must be a string"),
  query("folderIDs")
    .optional()
    .isArray()
    .withMessage("FolderIDs must be an array of strings"),
  middlewareValidationFunction,
];

export const getFolderInfoValidationRules = [
  param("id").isString().withMessage("ID must be a string"),
  middlewareValidationFunction,
];

export const getFolderListValidationRules = [
  query("search").optional().isString().withMessage("Search must be a string"),
  query("parent").optional().isString().withMessage("Parent must be a string"),
  query("sortBy").optional().isString().withMessage("Sort By must be a string"),
  query("trashMode")
    .optional()
    .isBoolean()
    .withMessage("Trash Mode must be a boolean"),
  middlewareValidationFunction,
];

export const downloadZipValidationRules = [
  query("folderIDs")
    .optional()
    .isArray()
    .withMessage("FolderIDs must be an array of strings"),
  query("fileIDs")
    .optional()
    .isArray()
    .withMessage("FileIDs must be an array of strings"),
  middlewareValidationFunction,
];

// PATCH

export const renameFolderValidationRules = [
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

export const moveFolderValidationRules = [
  body("parentID").isString().withMessage("Parent must be a string"),
  body("id").isString().withMessage("ID must be a string"),
  middlewareValidationFunction,
];

export const trashFolderValidationRules = [
  body("id").isString().withMessage("ID must be a string"),
  middlewareValidationFunction,
];

export const restoreFolderValidationRules = [
  body("id").isString().withMessage("ID must be a string"),
  middlewareValidationFunction,
];

// DELETE

export const deleteFolderValidationRules = [
  body("id").isString().withMessage("ID must be a string"),
  middlewareValidationFunction,
];

// POST

export const createFolderValidationRules = [
  body("name")
    .exists()
    .withMessage("Name is required")
    .isString()
    .withMessage("Name must be a string")
    .isLength({ min: 1, max: 256 })
    .withMessage(
      "Name must be at least 1 character and at most 256 characters"
    ),
  body("parent").optional().isString().withMessage("Parent must be a string"),
  middlewareValidationFunction,
];
