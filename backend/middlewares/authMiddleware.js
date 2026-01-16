import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import Organization from "../models/organizationModel.js";
import asyncHandler from "./asyncHandler.js";

// Ensure JWT_SECRET is properly configured
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET === 'admin123') {
  console.error('⚠️  SECURITY WARNING: JWT_SECRET not properly configured. Using default secret in production is a security risk!');
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set in production environment');
  }
}

const authenticate = asyncHandler(async (req, res, next) => {
  let token;

  // Check for JWT in cookies first, then Authorization header
  token = req.cookies.jwt;

  // Also check for token in Authorization header for API requests
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET || "admin123");

      // Add additional security checks
      if (!decoded.userId) {
        res.status(401);
        throw new Error("Invalid token format.");
      }

      // Fetch user and check if account is still active
      const user = await User.findById(decoded.userId).select("-password");

      if (!user) {
        res.status(401);
        throw new Error("User no longer exists.");
      }

      if (user.status === 'banned') {
        res.status(403);
        throw new Error("Account has been banned.");
      }

      if (user.status === 'inactive') {
        res.status(403);
        throw new Error("Account is inactive. Please contact support.");
      }

      // Check if user changed password after the token was issued
      if (user.passwordChangedAt && decoded.iat < user.passwordChangedAt.getTime() / 1000) {
        res.status(401);
        throw new Error("Password changed recently. Please log in again.");
      }

      req.user = user;
      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        res.status(401);
        throw new Error("Invalid token.");
      } else if (error.name === 'TokenExpiredError') {
        res.status(401);
        throw new Error("Token expired. Please log in again.");
      } else {
        res.status(401);
        throw new Error(error.message || "Not authorized, token failed.");
      }
    }
  } else {
    res.status(401);
    throw new Error("Not authorized, no token provided.");
  }
});

const authorizeVendor = (req, res, next) => {
  if (req.user && (req.user.role === "admin" || req.user.role === "vendor" || req.user.role === "seller")) {
    next();
  } else if (req.user && req.user.role === "organization_member" && req.user.organization) {
    // If they are a member of an organization, we let them pass for now.
    // Specific permissions will be checked by requirePermission in specific routes.
    next();
  } else {
    res.status(403).json({
      success: false,
      message: "Access denied. Vendor privileges required."
    });
  }
};

const IsAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: "Access denied. Administrator privileges required."
    });
  }
};

// Role-based access control middleware factory
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required."
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}`
      });
    }

    next();
  };
};

// Check if user owns the resource or is admin
const checkResourceOwnership = (resourceUserField = 'user') => {
  return (req, res, next) => {
    const resourceUserId = req.resource ? req.resource[resourceUserField] : req.params.userId;

    if (req.user.role === 'admin' || req.user._id.toString() === resourceUserId?.toString()) {
      next();
    } else {
      res.status(403).json({
        success: false,
        message: "Access denied. You can only access your own resources."
      });
    }
  };
}
// Check for specific granular permission
const requirePermission = (permission) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Admins have all permissions
    if (req.user.role === 'admin') return next();

    // Organizers (Vendor/Seller owners) have all permissions for their Org
    if (req.user.role === 'vendor' || req.user.role === 'seller') return next();

    // Check cached permissions (requires cachePermissions middleware to be run before)
    if (req.user._allPermissions && (req.user._allPermissions.includes(permission) || req.user._allPermissions.includes('all'))) {
      return next();
    }

    // Fallback: If cache not present (middleware skipped?), check directly but log warning
    // In production, you would enforce the middleware, but for safety:
    if (!req.user._permissionsResolved) {
      // ... (Old logic could be here, but let's assume cache middleware is used)
      // For now, let's keep the fallback for robustness during transition
      if (req.user.permissions && req.user.permissions.includes(permission)) return next();

      if (req.user.organization && req.user.userGroup) {
        const org = await Organization.findById(req.user.organization);
        if (org && org.isActive) {
          const group = org.userGroups.find(g => g.slug === req.user.userGroup);
          if (group && group.permissions.includes(permission)) return next();
        }
      }
    }

    res.status(403).json({
      success: false,
      message: `Access denied. Missing permission: ${permission}`
    });
  });
};

export {
  authenticate,
  authorizeVendor,
  IsAdmin,
  requireRole,
  checkResourceOwnership,
  requirePermission
};