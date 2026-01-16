import mongoose from "mongoose";

const organizationSchema = mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, lowercase: true, unique: true },
    type: { type: String, enum: ['vendor', 'seller'], required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Business Details (Merged from Vendor model)
    businessType: {
        type: String,
        enum: ['Individual', 'Corporation', 'Partnership', 'LLC', 'Other'],
        default: 'Individual'
    },
    taxId: { type: String, trim: true },
    bankDetails: {
        accountName: String,
        accountNumber: String,
        bankName: String,
        routingNumber: String,
        swiftCode: String
    },
    contactPerson: {
        name: String,
        email: String,
        phone: String
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
        rejectionReason: String
    }],

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

const Organization = mongoose.model("Organization", organizationSchema);
export default Organization;
