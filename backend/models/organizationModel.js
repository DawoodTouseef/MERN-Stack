import mongoose from "mongoose";

const organizationSchema = mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, lowercase: true, unique: true },
    type: { type: String, enum: ['vendor', 'seller'], required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Business Details (Merged from Vendor model)
    businessType: {
        type: String,
        enum: ['Proprietorship', 'Partnership', 'LLP', 'Private Limited', 'Public Limited'],
        required: true
    },
    productCategory: {
        type: String,
        // required: true // Optional for now to avoid breaking existing
    },
    taxId: { type: String, trim: true },
    gstNumber: { type: String, trim: true },
    panNumber: { type: String, trim: true },

    bankDetails: {
        accountName: String,
        accountNumber: String,
        bankName: String,
        ifsc: String,
        branch: String,
        routingNumber: String, // Keep legacy
        swiftCode: String      // Keep legacy
    },
    contactPerson: {
        name: String,
        email: String,
        phone: String,
        designation: String
    },

    // Verification
    isVerified: { type: Boolean, default: false },
    verificationStatus: {
        type: String,
        enum: ['pending', 'submitted', 'verified', 'rejected', 'suspended'],
        default: 'pending'
    },
    verificationDocuments: [{
        docType: { type: String, required: true }, // e.g. "Business License", "Tax ID"
        url: { type: String, required: true },
        status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
        uploadedAt: { type: Date, default: Date.now },
        rejectionReason: String,
        kybVerificationId: String,
        kybConfidence: Number,
        kybProvider: String,
        extractedData: Object
    }],
    kybAttempts: { type: Number, default: 0 },
    lastKybAttempt: Date,
    kybFailureReason: String,

    // Custom User Groups / Roles within the Org
    userGroups: [{
        name: { type: String, required: true }, // e.g. "Order Manager", "Accountant"
        slug: { type: String, required: true }, // unique slug within org
        description: String,
        permissions: [{ type: String }], // e.g. ["manage_orders", "view_financials"]
        isSystem: { type: Boolean, default: false }, // System groups cannot be deleted
        color: { type: String, default: '#3B82F6' } // For UI badges
    }],

    // Meta
    description: String,
    logo: String,
    banner: String,
    website: String,
    contactEmail: String,
    contactPhone: String,
    address: {
        street: String,
        city: String,
        state: String,
        country: String,
        zipCode: String
    },

    // GeoJSON Location
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            index: '2dsphere'
        },
        formattedAddress: String
    },

    // Settings
    settings: {
        currency: { type: String, default: 'USD' },
        timezone: { type: String, default: 'UTC' },
        platformFeePercentage: { type: Number, default: 10 }, // Real-world fee logic
        notifications: {
            email: { type: Boolean, default: true },
            sms: { type: Boolean, default: false }
        }
    },

    isActive: { type: Boolean, default: true }

}, { timestamps: true });

// Indexes
organizationSchema.index({ name: 1 });
organizationSchema.index({ slug: 1 });
organizationSchema.index({ owner: 1 });
organizationSchema.index({ verificationStatus: 1 });
organizationSchema.index({ "location.coordinates": "2dsphere" });

const Organization = mongoose.model("Organization", organizationSchema);
export default Organization;
