import TaxRule from "../models/taxModel.js";
import Product from "../models/productModel.js";


// Create or update a tax rule
export const createOrUpdateTax = async (req, res) => {
  try {
    const { country, state, category, brand, product, rate, description, productCode } = req.body;

    let existing = await TaxRule.findOne({
      country,
      state,
      category,
      brand,
      product,
      productCode,
    });

    if (existing) {
      existing.rate = rate;
      existing.description = description;
      await existing.save();
      return res.status(200).json({ message: "Tax rule updated", rule: existing });
    }

    const newRule = await TaxRule.create({
      country,
      state,
      category,
      brand,
      product,
      productCode,
      rate,
      description,
    });

    res.status(201).json({ message: "Tax rule created", rule: newRule });
  } catch (err) {
    res.status(500).json({ message: "Failed to create or update tax", error: err.message });
  }
};

// Get tax rate for a product and customer location
export const calculateTax = async (req, res) => {
  try {
    const { productId, country, state } = req.body;

    const product = await Product.findById(productId).populate("brand category");
    if (!product) return res.status(404).json({ message: "Product not found" });

    const taxRule = await TaxRule.findOne({
      $or: [
        { product: product._id },
        { brand: product.brand._id },
        { category: product.category._id },
        { productCode: product.productCode },
      ],
      country,
      $or: [{ state }, { state: null }],
    }).sort({ state: -1 }); 

    if (!taxRule) return res.status(200).json({ tax: 0, message: "No applicable tax rule" });

    const taxAmount = (product.price * taxRule.rate) / 100;

    res.status(200).json({
      tax: taxAmount.toFixed(2),
      rate: taxRule.rate,
      totalPrice: (product.price + taxAmount).toFixed(2),
    });
  } catch (err) {
    res.status(500).json({ message: "Tax calculation failed", error: err.message });
  }
};

// Get all tax rules (admin)
export const getAllTaxRules = async (req, res) => {
  try {
    const rules = await TaxRule.find().populate("category brand product");
    res.status(200).json(rules);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch tax rules", error: err.message });
  }
};

// Delete a tax rule
export const deleteTaxRule = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await TaxRule.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Tax rule not found" });
    res.status(200).json({ message: "Tax rule deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete tax rule", error: err.message });
  }
};
