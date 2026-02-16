
import asyncHandler from "../middlewares/asyncHandler.js";
import Organization from "../models/organizationModel.js";
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import verificationService from "../services/verificationService.js";

// @desc    Create new organization (Vendor/Seller)
// @route   POST /api/organizations
// @access  Private (User who wants to become a vendor)
const createOrganization = asyncHandler(async (req, res) => {
    const { name, type, slug, description, businessType, address, contactPerson } = req.body;

    // Check if user already owns an organization
    const existingOrg = await Organization.findOne({ owner: req.user._id });
    if (existingOrg) {
        res.status(400);
        throw new Error("User already owns an organization.");
    }

    // Check if slug exists
    const slugExists = await Organization.findOne({ slug });
    if (slugExists) {
        res.status(400);
        throw new Error("Organization slug already exists.");
    }

    const organization = await Organization.create({
        name,
        slug,
        type,
        owner: req.user._id,
        description,
        businessType,
        address,
        contactPerson,
        userGroups: [
            {
                name: "Admin",
                slug: "admin",
                description: "Full access to organization",
                permissions: ["all"],
                isSystem: true,
                color: "#EF4444"
            }
        ]
    });

    if (organization) {
        // Update user role
        const user = await User.findById(req.user._id);
        user.role = type; // vendor or seller
        user.organization = organization._id;
        user.userGroup = "admin"; // Assign owner to admin group
        await user.save();

        res.status(201).json(organization);
    } else {
        res.status(400);
        throw new Error("Invalid organization data");
    }
});

// @desc    Get current organization profile
// @route   GET /api/organizations/me
// @access  Private (Organization Member)
const getCurrentOrganization = asyncHandler(async (req, res) => {
    if (!req.user.organization) {
        res.status(404);
        throw new Error("User does not belong to an organization.");
    }

    const organization = await Organization.findById(req.user.organization);
    if (organization) {
        res.json(organization);
    } else {
        res.status(404);
        throw new Error("Organization not found");
    }
});

// @desc    Create a sub-user
// @route   POST /api/organizations/users
// @access  Private (Admin or Manager permission)
const createSubUser = asyncHandler(async (req, res) => {
    const { username, email, password, userGroup } = req.body;
    const orgId = req.user.organization;

    const org = await Organization.findById(orgId);
    if (!org) {
        res.status(404);
        throw new Error("Organization not found");
    }

    // Check if group exists
    const group = org.userGroups.find(g => g.slug === userGroup);
    if (!group) {
        res.status(400);
        throw new Error("Invalid user group");
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error("User already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
        username,
        email,
        password: hashedPassword,
        role: "organization_member",
        organization: orgId,
        userGroup: userGroup,
        emailVerified: true // Auto verify sub-users created by admin
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            userGroup: user.userGroup
        });
    } else {
        res.status(400);
        throw new Error("Invalid user data");
    }
});

// @desc    Get all sub-users
// @route   GET /api/organizations/users
// @access  Private
const getSubUsers = asyncHandler(async (req, res) => {
    const users = await User.find({ organization: req.user.organization }).select("-password");
    res.json(users);
});

// @desc    Delete a sub-user
// @route   DELETE /api/organizations/users/:id
// @access  Private (Admin permission)
const deleteSubUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    // Ensure user belongs to the same organization and is not the owner
    if (user.organization.toString() !== req.user.organization.toString()) {
        res.status(403);
        throw new Error("Not authorized to delete this user");
    }

    const org = await Organization.findById(req.user.organization);
    if (user._id.toString() === org.owner.toString()) {
        res.status(400);
        throw new Error("Cannot delete the organization owner");
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User removed from organization" });
});

// @desc    Create a user group
// @route   POST /api/organizations/groups
// @access  Private (Admin permission)
const createGroup = asyncHandler(async (req, res) => {
    const { name, slug, description, permissions, color } = req.body;
    const org = await Organization.findById(req.user.organization);

    if (org.userGroups.find(g => g.slug === slug)) {
        res.status(400);
        throw new Error("Group slug already exists");
    }

    org.userGroups.push({ name, slug, description, permissions, color });
    await org.save();
    res.status(201).json(org.userGroups);
});

// @desc    Update a user group
// @route   PUT /api/organizations/groups/:slug
// @access  Private (Admin permission)
const updateGroup = asyncHandler(async (req, res) => {
    const { name, description, permissions, color } = req.body;
    const org = await Organization.findById(req.user.organization);

    const groupIndex = org.userGroups.findIndex(g => g.slug === req.params.slug);
    if (groupIndex === -1) {
        res.status(404);
        throw new Error("Group not found");
    }

    const group = org.userGroups[groupIndex];
    group.name = name || group.name;
    group.description = description || group.description;
    group.permissions = permissions || group.permissions;
    group.color = color || group.color;

    await org.save();
    res.json(org.userGroups);
});

// @desc    Delete a user group
// @route   DELETE /api/organizations/groups/:slug
// @access  Private (Admin permission)
const deleteGroup = asyncHandler(async (req, res) => {
    const org = await Organization.findById(req.user.organization);

    const groupIndex = org.userGroups.findIndex(g => g.slug === req.params.slug);
    if (groupIndex === -1) {
        res.status(404);
        throw new Error("Group not found");
    }

    if (org.userGroups[groupIndex].isSystem) {
        res.status(400);
        throw new Error("Cannot delete system groups");
    }

    // Check if any users are in this group
    const userCount = await User.countDocuments({
        organization: org._id,
        userGroup: req.params.slug
    });

    if (userCount > 0) {
        res.status(400);
        throw new Error("Cannot delete group while it has active members");
    }

    org.userGroups.splice(groupIndex, 1);
    await org.save();
    res.json(org.userGroups);
});

// @desc    Submit documents for verification
// @route   POST /api/organizations/verify
// @access  Private (Organization Owner)
const submitVerificationDocuments = asyncHandler(async (req, res) => {
    // 1. Destructure all the new fields from the request body
    const {
        businessType,
        orgName,
        address,
        contactPerson,
        registrationDoc,
        panCard,
        gstCertificate,
        partnershipDeed,
        incorporationCert,
        moa,
        aoa,
        panNumber,
        gstNumber,
        productCategory,
        complianceCert,
        bankDetails,
        cancelledCheque,
        signatoryName,
        signatoryDesignation,
        signatoryIdProof,
        documents // Expecting array of { docType, url } for backward compatibility or direct array
    } = req.body;

    const orgId = req.user.organization;
    const org = await Organization.findById(orgId);

    if (!org) {
        res.status(404);
        throw new Error("Organization not found");
    }

    if (org.verificationStatus === 'verified') {
        res.status(400);
        throw new Error("Organization is already verified");
    }

    // 2. Update Organization Basic Details
    if (orgName) org.name = orgName;
    if (businessType) org.businessType = businessType;
    if (address) org.address = address;

    // Update Contact Person (merge)
    if (contactPerson) {
        org.contactPerson = { ...org.contactPerson, ...contactPerson };
        if (signatoryName) org.contactPerson.name = signatoryName; // Assuming signatory is primary contact or update logic
        if (signatoryDesignation) org.contactPerson.designation = signatoryDesignation;
    }

    // Update Tax Info
    if (panNumber) org.panNumber = panNumber;
    if (gstNumber) org.gstNumber = gstNumber;
    if (productCategory) org.productCategory = productCategory;

    // Update Bank Details
    if (bankDetails) {
        org.bankDetails = {
            ...org.bankDetails,
            ...bankDetails
        };
    }

    // 3. Process Documents
    // Combine individual file fields into the documents array if they come separately
    // OR assuming frontend sends a unified 'documents' array. 
    // Let's support the unified 'documents' array as per the current controller standard, 
    // but allowing the frontend to send the rich payload.
    // The frontend CreateOrganization.jsx sends a big object. 
    // We need to verify how frontend sends data. 
    // For now, let's assume 'documents' array is constructed by frontend or we construct it here.

    let docsToProcess = documents || [];

    // If documents are not passed as an array but as individual fields (if we changed frontend logic)
    // We would map them here. But better to let frontend handle the mapping to [{docType, url}].

    // Clear old pending documents if re-submitting? 
    // Or append? Let's replace for a fresh submission.
    org.verificationDocuments = docsToProcess.map(doc => ({
        docType: doc.docType,
        url: doc.url,
        status: 'pending',
        uploadedAt: new Date()
    }));

    org.verificationStatus = 'submitted';
    org.kybAttempts = (org.kybAttempts || 0) + 1;
    org.lastKybAttempt = new Date();

    await org.save();

    // 4. Trigger Verification Process
    let allVerified = true;
    let rejectionReason = null;

    // Process each document
    // In production, this should be an async job queue (BullMQ/RabbitMQ)
    for (let i = 0; i < org.verificationDocuments.length; i++) {
        const doc = org.verificationDocuments[i];

        // Skip verification for some docs if needed, or verify all
        const result = await verificationService.verifyDocument(doc.url, doc.docType, {
            orgName: org.name,
            taxId: org.panNumber
        });

        doc.status = result.status; // 'approved' | 'rejected'
        doc.kybVerificationId = result.kybVerificationId;
        doc.kybConfidence = result.kybConfidence;
        doc.kybProvider = result.kybProvider;
        doc.extractedData = result.extractedData;

        if (result.status !== 'approved') {
            allVerified = false;
            doc.rejectionReason = result.reason;
            rejectionReason = result.reason || 'Document verification failed';
        }
    }

    // 5. Update Organization Status based on results
    if (allVerified && org.verificationDocuments.length > 0) {
        org.verificationStatus = 'verified';
        org.isVerified = true;

        // Update User Status
        await User.updateOne({ _id: org.owner }, { vendorVerified: true });
    } else {
        // If automatic verification fails, set to 'rejected' or 'submitted' (pending manual review)
        // For now, let's set to 'submitted' if confidence is low, or 'rejected' if explicit failure.
        // If we want manual review fallback:
        org.verificationStatus = 'submitted'; // Keep as submitted for admin to review
        org.isVerified = false;
        org.kybFailureReason = rejectionReason;
    }

    await org.save();

    res.json({
        success: true,
        status: org.verificationStatus,
        documents: org.verificationDocuments,
        message: allVerified ? "Verification successful" : "Documents submitted for manual review"
    });
});


// @desc    Get all organizations (Admin)
// @route   GET /api/organizations
// @access  Private (Admin)
const getOrganizations = asyncHandler(async (req, res) => {
    const { status, type } = req.query;
    const query = {};
    if (status) query.verificationStatus = status;
    if (type) query.type = type;

    const organizations = await Organization.find(query).populate('owner', 'username email');
    res.json(organizations);
});

// @desc    Update organization verification status (Admin)
// @route   PUT /api/organizations/:id/verify
// @access  Private (Admin)
const updateVerificationStatus = asyncHandler(async (req, res) => {
    const { status, remarks, documentStatuses } = req.body; // documentStatuses: [{ id, status, reason }]
    const org = await Organization.findById(req.params.id);

    if (!org) {
        res.status(404);
        throw new Error("Organization not found");
    }

    if (status) org.verificationStatus = status;

    // Update individual document statuses if provided
    if (documentStatuses && Array.isArray(documentStatuses)) {
        documentStatuses.forEach(ds => {
            const doc = org.verificationDocuments.id(ds.id);
            if (doc) {
                doc.status = ds.status;
                if (ds.reason) doc.rejectionReason = ds.reason;
            }
        });
    }

    if (status === 'verified') {
        org.isVerified = true;
        await User.updateOne({ _id: org.owner }, { vendorVerified: true });
    } else if (status === 'rejected' || status === 'suspended') {
        org.isVerified = false;
        await User.updateOne({ _id: org.owner }, { vendorVerified: false });
    }

    await org.save();
    res.json({ success: true, organization: org });
});

// @desc    Get verification status
// @route   GET /api/organizations/verification-status
// @access  Private (Vendor)
const getVerificationStatus = asyncHandler(async (req, res) => {
    const org = await Organization.findOne({ owner: req.user._id });
    if (!org) {
        res.status(404);
        throw new Error("Organization not found");
    }
    res.json({
        status: org.verificationStatus,
        isVerified: org.isVerified,
        documents: org.verificationDocuments,
        remarks: org.kybFailureReason,
        lastAttempt: org.lastKybAttempt
    });
});

export {
    createOrganization,
    getCurrentOrganization,
    getOrganizations,
    updateVerificationStatus,
    getVerificationStatus,
    createSubUser,
    getSubUsers,
    deleteSubUser,
    createGroup,
    updateGroup,
    deleteGroup,
    submitVerificationDocuments
};
