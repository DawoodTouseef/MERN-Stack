import mongoose from "mongoose";

const taxRuleSchema = mongoose.Schema({
  country: { type: String, required: true },
  state: { type: String }, // optional

  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", default: null },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
  brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand", default: null },

  productCode: { type: String }, // optional
  rate: { type: Number, required: true }, // e.g. 18
  description: { type: String },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Admin ID
}, { timestamps: true });

const TaxRule = mongoose.model("TaxRule", taxRuleSchema);
export default TaxRule;