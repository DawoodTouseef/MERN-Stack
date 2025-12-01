import express from "express";
import {
  loginUser,
  registerUser,
  logoutUser,
  getUserAuthLogs,
  getAllAuthLogs,
} from "../controllers/authController.js";
import { authenticate as protect, IsAdmin as admin } from "../middlewares/authMiddleware.js";
import { body } from "express-validator";

const router = express.Router();

// Validation middleware
const loginValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

const registerValidation = [
  body("username")
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters long")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, and underscores"),
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("Password must contain at least one lowercase letter, one uppercase letter, and one digit"),
];

router.route("/").post(registerValidation, registerUser);
router.route("/login").post(loginValidation, loginUser);
router.route("/logout").post(logoutUser);
router.route("/logs").get(protect, getUserAuthLogs);
router.route("/logs/all").get(protect, admin, getAllAuthLogs);

export default router;