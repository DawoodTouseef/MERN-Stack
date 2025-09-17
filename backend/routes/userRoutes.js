import express from "express";
import {
  createUser,
  loginUser,
  logoutCurrentUser,
  getAllUsers,
  getCurrentUserProfile,
  updateCurrentUserProfile,
  deleteUserById,
  getUserById,
  updateUserById,
  requestPasswordReset,
  changePassword
} from "../controllers/userController.js";

import { authenticate, authorizeVendor ,IsAdmin} from "../middlewares/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .post(createUser)
  .get(authenticate, authorizeVendor, getAllUsers);

router.post("/auth", loginUser);
router.post("/logout", logoutCurrentUser);

router
  .route("/profile")
  .get(authenticate, getCurrentUserProfile)
  .put(authenticate, updateCurrentUserProfile);

// ADMIN ROUTES 👇
router
  .route("/:id")
  .delete(authenticate, authorizeVendor, deleteUserById)
  .get(authenticate, authorizeVendor, getUserById)
  .put(authenticate, authorizeVendor, updateUserById);
router
.route("/request-password")
.post(requestPasswordReset)

router
.route('/reset-password')
.post(changePassword)
export default router;
