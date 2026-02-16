import asyncHandler from 'express-async-handler';
import Organization from '../models/organizationModel.js';

// @desc    Check if organization is verified
// @access  Private (Vendor)
const requireVerifiedOrganization = asyncHandler(async (req, res, next) => {
    const organization = await Organization.findOne({ owner: req.user._id });

    if (!organization) {
        res.status(403);
        throw new Error('Organization not found. Please complete vendor onboarding.');
    }

    if (!organization.isVerified) {
        res.status(403);
        throw new Error(`Organization verification status: ${organization.verificationStatus}. Access denied.`);
    }

    // Attach organization to request object for easy access in controllers
    req.organization = organization;
    next();
});

// @desc    Check verification status without blocking (for limited access pages)
// @access  Private (Vendor)
const checkVerificationStatus = asyncHandler(async (req, res, next) => {
    const organization = await Organization.findOne({ owner: req.user._id });

    if (organization) {
        req.organization = organization;
        req.isVerified = organization.isVerified;
    } else {
        req.isVerified = false;
    }

    next();
});

export { requireVerifiedOrganization, checkVerificationStatus };
