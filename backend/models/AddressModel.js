import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },

  fullName: { type: String, required: true },
  phone: { type: String, required: true },

  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String },
  postalCode: { type: String, required: true },
  country: { type: String, required: true },

  label: { type: String, enum: ["Home", "Work", "Other"], default: "Home" },
  isDefault: { type: Boolean, default: false },

  location: {
    lat: { type: Number },
    lng: { type: Number },
  },
}, { timestamps: true });

export default mongoose.models.Address || mongoose.model("Address", AddressSchema);
