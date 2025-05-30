import Category from "../models/categoryModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import slugify from "slugify";

// @desc    Create a new category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = asyncHandler(async (req, res) => {
  const { name, description, image, parent, isActive } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Category name is required" });
  }

  const slug = slugify(name, { lower: true });

  const existing = await Category.findOne({ slug });
  if (existing) {
    return res.status(400).json({ error: "Category already exists" });
  }

  const category = new Category({
    name,
    slug,
    description,
    image,
    parent: parent || null,
    isActive: isActive !== undefined ? isActive : true,
    user: req.user._id,
  });

  const saved = await category.save();
  res.status(201).json(saved);
});

// @desc    Update a category
// @route   PUT /api/categories/:categoryId
// @access  Private/Admin
const updateCategory = asyncHandler(async (req, res) => {
  const { name, description, image, parent, isActive } = req.body;
  const { categoryId } = req.params;

  const category = await Category.findById(categoryId);
  if (!category) {
    return res.status(404).json({ error: "Category not found" });
  }

  if (name) {
    category.name = name;
    category.slug = slugify(name, { lower: true });
  }
  if (description !== undefined) category.description = description;
  if (image !== undefined) category.image = image;
  if (parent !== undefined) category.parent = parent;
  if (isActive !== undefined) category.isActive = isActive;

  const updated = await category.save();
  res.json(updated);
});

// @desc    Delete a category
// @route   DELETE /api/categories/:categoryId
// @access  Private/Admin
const removeCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;

  const deleted = await Category.findByIdAndDelete(categoryId);
  if (!deleted) {
    return res.status(404).json({ error: "Category not found" });
  }

  res.json({ message: "Category deleted successfully" });
});

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const listCategory = asyncHandler(async (req, res) => {
  const categories = await Category.find({})
    .populate("parent", "name")
    .sort({ createdAt: -1 });
  res.json(categories);
});

// @desc    Get a single category by ID
// @route   GET /api/categories/:id
// @access  Public
const readCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id).populate("parent", "name");
  if (!category) {
    return res.status(404).json({ error: "Category not found" });
  }
  res.json(category);
});

export {
  createCategory,
  updateCategory,
  removeCategory,
  listCategory,
  readCategory,
};