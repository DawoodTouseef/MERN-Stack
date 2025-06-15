import Page from "../models/PageModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";

// Create a new page
export const createPage = asyncHandler(async (req, res) => {
  const { title, slug, route, content, status, publishDate, expiryDate } = req.body;

  const page = new Page({
    title,
    slug,
    route,
    content,
    status,
    publishDate,
    expiryDate,
    createdBy: req.user._id, // Assuming user info is available via authentication middleware
  });

  const savedPage = await page.save();
  res.status(201).json(savedPage);
});

// Get all pages
export const getPages = asyncHandler(async (req, res) => {
  const pages = await Page.find().sort({ createdAt: -1 });
  res.status(200).json(pages);
});

// Get a single page by ID
export const getPageById = asyncHandler(async (req, res) => {
  const page = await Page.findById(req.params.id);
  if (!page) {
    res.status(404);
    throw new Error("Page not found");
  }
  res.status(200).json(page);
});

// Update a page
export const updatePage = asyncHandler(async (req, res) => {
  const { title, slug, route, content, status, publishDate, expiryDate } = req.body;

  const page = await Page.findById(req.params.id);
  if (!page) {
    res.status(404);
    throw new Error("Page not found");
  }

  page.title = title || page.title;
  page.slug = slug || page.slug;
  page.route = route || page.route;
  page.content = content || page.content;
  page.status = status || page.status;
  page.publishDate = publishDate || page.publishDate;
  page.expiryDate = expiryDate || page.expiryDate;

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

  await page.remove();
  res.status(200).json({ message: "Page deleted successfully" });
});