import { query, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

export const moveFolderValidationRules = [
  query("parent").optional().isString().withMessage("Parent must be a string"),
  query("search").optional().isString().withMessage("Search must be a string"),
  query("folderID")
    .optional()
    .isString()
    .withMessage("FolderID must be a string"),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
