
import express from "express";
import {
    createOrganization,
    getCurrentOrganization,
    createSubUser,
    getSubUsers,
    deleteSubUser,
    createGroup,
    updateGroup,
    deleteGroup,
    submitVerificationDocuments,
    getOrganizations,
    updateVerificationStatus
} from "../controllers/organizationController.js";
import { authenticate, authorizeVendor, requirePermission } from "../middlewares/authMiddleware.js";
import { cachePermissions } from "../middlewares/permissionCache.js";

const router = express.Router();

// Admin routes
router.get("/", authenticate, cachePermissions, requirePermission("manage_all_organizations"), getOrganizations);
router.put("/:id/verify", authenticate, cachePermissions, requirePermission("manage_all_organizations"), updateVerificationStatus);

router.post("/", authenticate, createOrganization);
router.get("/me", authenticate, getCurrentOrganization);

// Verification
router.post("/verify", authenticate, authorizeVendor, submitVerificationDocuments);

// Sub-user management
router.route("/users")
    .post(authenticate, cachePermissions, authorizeVendor, requirePermission("manage_users"), createSubUser)
    .get(authenticate, cachePermissions, getSubUsers);

router.delete("/users/:id", authenticate, cachePermissions, authorizeVendor, requirePermission("manage_users"), deleteSubUser);

// Group management
router.route("/groups")
    .post(authenticate, cachePermissions, authorizeVendor, requirePermission("manage_groups"), createGroup);

router.route("/groups/:slug")
    .put(authenticate, cachePermissions, authorizeVendor, requirePermission("manage_groups"), updateGroup)
    .delete(authenticate, cachePermissions, authorizeVendor, requirePermission("manage_groups"), deleteGroup);

export default router;
