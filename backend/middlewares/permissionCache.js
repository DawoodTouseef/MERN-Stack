
import asyncHandler from "./asyncHandler.js";
import Organization from "../models/organizationModel.js";

// Cache resolved permissions per request to avoid repeated DB calls
export const cachePermissions = asyncHandler(async (req, res, next) => {
    if (!req.user) return next();

    // Cache resolved permissions on req.user
    if (!req.user._permissionsResolved) {
        const userPermissions = req.user.permissions || [];

        // If user belongs to an organization and has a group, fetch group permissions
        if (req.user.organization && req.user.userGroup) {
            try {
                // Use lean() for performance since we just need to read
                const org = await Organization.findById(req.user.organization)
                    .select('userGroups')
                    .lean();

                const group = org?.userGroups?.find(g => g.slug === req.user.userGroup);
                const groupPermissions = group?.permissions || [];

                // Merge and deduplicate
                req.user._allPermissions = [
                    ...new Set([...userPermissions, ...groupPermissions])
                ];
            } catch (error) {
                console.error("Error Caching Permissions:", error);
                // Fallback to minimal permissions on error
                req.user._allPermissions = userPermissions;
            }
        } else {
            req.user._allPermissions = userPermissions;
        }

        req.user._permissionsResolved = true;
    }

    next();
});
