import { body, param, query, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import { middlewareValidationFunction } from "../utils/middleware-utils";

// PATCH

export const changePasswordValidationRules = [
  body("oldPassword")
    .exists()
    .withMessage("Old password is required")
    .isString()
    .withMessage("Old password must be a string")
    .isLength({ min: 6, max: 256 })
    .withMessage(
      "Old password must be at least 6 characters and at most 256 characters"
    ),
  body("newPassword")
    .exists()
    .withMessage("New password is required")
    .isString()
    .withMessage("New password must be a string")
    .isLength({ min: 6, max: 256 })
    .withMessage(
      "New password must be at least 6 characters and at most 256 characters"
    ),
  middlewareValidationFunction,
];

// POST

export const createAccountValidationRules = [
  body("email")
    .exists()
    .withMessage("Email is required")
    .isString()
    .withMessage("Email must be a string")
    .isLength({ min: 3, max: 320 })
    .withMessage(
      "Email must be at least 3 characters and at most 320 characters"
    )
    .isEmail()
    .withMessage("Email is invalid"),
  body("password")
    .exists()
    .withMessage("Password is required")
    .isString()
    .withMessage("Password must be a string")
    .isLength({ min: 6, max: 256 })
    .withMessage(
      "Password must be at least 6 characters and at most 256 characters"
    ),
  middlewareValidationFunction,
];

export const loginAccountValidationRules = [
  body("email")
    .exists()
    .withMessage("Email is required")
    .isString()
    .withMessage("Email must be a string")
    .isLength({ min: 3, max: 320 })
    .withMessage(
      "Email must be at least 3 characters and at most 320 characters"
    )
    .isEmail()
    .withMessage("Email is invalid"),
  body("password")
    .exists()
    .withMessage("Password is required")
    .isString()
    .withMessage("Password must be a string")
    .isLength({ min: 6, max: 256 })
    .withMessage(
      "Password must be at least 6 characters and at most 256 characters"
    ),
  middlewareValidationFunction,
];
