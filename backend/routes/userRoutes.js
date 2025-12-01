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
  verifyVendor,
  rejectVendor,
  upgradeSellerToVendor,
  requestPasswordReset,
  changePassword
} from "../controllers/userController.js";

import { authenticate, authorizeVendor ,IsAdmin} from "../middlewares/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .post(createUser)
  .get(authenticate, IsAdmin, getAllUsers);

router.post("/auth", loginUser);
router.post("/logout", logoutCurrentUser);

router
  .route("/profile")
  .get(authenticate, getCurrentUserProfile)
  .put(authenticate, updateCurrentUserProfile);

// Route for upgrading seller to vendor
router
  .route("/upgrade-to-vendor")
  .post(authenticate, upgradeSellerToVendor);

// ADMIN ROUTES 👇
router
  .route("/:id")
  .delete(authenticate, IsAdmin, deleteUserById)
  .get(authenticate, IsAdmin, getUserById)
  .put(authenticate, IsAdmin, updateUserById);

// Vendor verification routes (admin only)
router
  .route("/:id/verify-vendor")
  .put(authenticate, IsAdmin, verifyVendor);

router
  .route("/:id/reject-vendor")
  .put(authenticate, IsAdmin, rejectVendor);

router
.route("/request-password")
.post(requestPasswordReset);

router
.route('/reset-password')
.post(changePassword);

export default router;