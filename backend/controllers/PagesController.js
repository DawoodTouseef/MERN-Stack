import Page from "../models/PageModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";

// Create a new page
export const createPage = asyncHandler(async (req, res) => {
  const { title, slug, route, content, status, publishDate, expiryDate, category, tags } = req.body;

  const page = new Page({
    title,
    slug,
    route,
    content,
    status,
    publishDate,
    expiryDate,
    category, // Add category for blog posts
    tags,     // Add tags for blog posts
    createdBy: req.user._id, // Assuming user info is available via authentication middleware
  });

  const savedPage = await page.save();
  res.status(201).json(savedPage);
});

// Get all pages
export const getPages = asyncHandler(async (req, res) => {
  const { category, tags, page = 1, limit = 10, search = "" } = req.query;
  
  // Build filter
  const filter = {};
  
  // Filter by category if provided
  if (category) {
    filter.category = category;
  }
  
  // Filter by tags if provided
  if (tags) {
    filter.tags = { $in: tags.split(",") };
  }
  
  // Search by title or content if provided
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { content: { $regex: search, $options: "i" } }
    ];
  }
  
  // Only show published pages
  filter.status = "published";
  
  const pages = await Page.find(filter)
    .sort({ publishDate: -1, createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);
    
  const total = await Page.countDocuments(filter);
  
  res.status(200).json({
    pages,
    totalPages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    total
  });
});

// Get a single page by ID
export const getPageById = asyncHandler(async (req, res) => {
  const page = await Page.findById(req.params.id);
  if (!page) {
    res.status(404);
    throw new Error("Page not found");
  }
  // Only show published pages unless it's the creator
  if (page.status !== "published" && (!req.user || req.user._id.toString() !== page.createdBy.toString())) {
    res.status(404);
    throw new Error("Page not found");
  }
  res.status(200).json(page);
});

// Update a page
export const updatePage = asyncHandler(async (req, res) => {
  const { title, slug, route, content, status, publishDate, expiryDate, category, tags } = req.body;

  const page = await Page.findById(req.params.id);
  if (!page) {
    res.status(404);
    throw new Error("Page not found");
  }

  // Check if user is the creator or admin
  if (req.user._id.toString() !== page.createdBy.toString() && req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized to update this page");
  }

  page.title = title || page.title;
  page.slug = slug || page.slug;
  page.route = route || page.route;
  page.content = content || page.content;
  page.status = status || page.status;
  page.publishDate = publishDate || page.publishDate;
  page.expiryDate = expiryDate || page.expiryDate;
  page.category = category || page.category;
  page.tags = tags || page.tags;

  const updatedPage = await page.save();
  res.status(200).json(updatedPage);
});

// Delete a page
export const deletePage = asyncHandler(async (req, res) => {
  const page = await Page.findById(req.params.id);
  if (!page) {
    res.status(404);
    throw new Error("Page not found");
  }

  // Check if user is the creator or admin
  if (req.user._id.toString() !== page.createdBy.toString() && req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized to delete this page");
  }

  await page.remove();
  res.status(200).json({ message: "Page deleted successfully" });
});

// Get blog posts (pages with blog category)
export const getBlogPosts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = "" } = req.query;
  
  // Build filter for blog posts
  const filter = {
    status: "published",
    $or: [
      { category: { $regex: "blog", $options: "i" } },
      { tags: { $in: ["blog", "post", "article"] } },
      { route: { $regex: "^/blog", $options: "i" } }
    ]
  };
  
  // Search by title or content if provided
  if (search) {
    filter.$and = [
      {
        $or: [
          { title: { $regex: search, $options: "i" } },
          { content: { $regex: search, $options: "i" } }
        ]
      }
    ];
  }
  
  const blogPosts = await Page.find(filter)
    .sort({ publishDate: -1, createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);
    
  const total = await Page.countDocuments(filter);
  
  res.status(200).json({
    posts: blogPosts,
    totalPages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    total
  });
});