import BrandModel from "../models/BrandModel.js";
import slugify from "slugify";

// Create a new Brand
export const createBrand = async (req, res) => {
  try {
    const { name, logo, description, website, isActive } = req.body;
    // Validate required fields
    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Brand name is required" });
    }

    const slug = slugify(name, { lower: true });

    const existing = await BrandModel.findOne({ slug });
    if (existing) {
      return res.status(400).json({ message: "Brand already exists" });
    }
    let logoUrl = logo[0];
    const newBrand = new BrandModel({
      user: req.user._id,
      name,
      slug,
      logo:logoUrl,
      description,
      website,
      isActive: isActive !== undefined ? isActive : true,
    });
    await newBrand.save();
    res.status(201).json({ message: "Brand created successfully", brand: newBrand });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllBrands = async (req, res) => {
  try {
    const brands = await BrandModel.find();
    res.json(brands);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all Brandes for a specific user
export const getUserBrandes = async (req, res) => {
  try {
    const brands = await BrandModel.find({ user: req.user._id });
    res.json(brands);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get a single Brand by ID
export const getBrandById = async (req, res) => {
  try {
    const brand = await BrandModel.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }
    res.json(brand);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update an Brand
export const updateBrandById = async (req, res) => {
  try {
    // Allow admin to update any brand
    const query = req.user.role === 'admin' 
      ? { _id: req.params.id } 
      : { _id: req.params.id, user: req.user._id };

    const brand = await BrandModel.findOne(query);

    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    const { name, logo, description, website, isActive } = req.body;

    brand.name = name || brand.name;
    brand.logo = logo || brand.logo;
    brand.description = description || brand.description;
    brand.website = website || brand.website;
    brand.isActive = isActive !== undefined ? isActive : brand.isActive;
    brand.slug = slugify(name, { lower: true });

    const updated = await brand.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete an Brand
export const deleteBrand = async (req, res) => {
  try {
    // Allow admin to delete any brand
    const query = req.user.role === 'admin' 
      ? { _id: req.params.id } 
      : { _id: req.params.id, user: req.user._id };

    const brand = await BrandModel.findOneAndDelete(query);
    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }
    res.json({ message: "Brand deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};