import Banner from "../models/bannerModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";

// Create a new banner
export const createBanner = asyncHandler(async (req, res) => {
  const { title, subtitle, image, ctaText, ctaLink, startDate, endDate, priority, tags } = req.body;

  const banner = new Banner({
    title,
    subtitle,
    image,
    ctaText,
    ctaLink,
    startDate,
    endDate,
    priority,
    tags,
    createdBy: req.user._id, // Assuming user info is available via authentication middleware
  });

  const savedBanner = await banner.save();
  res.status(201).json(savedBanner);
});

// Get all banners
export const getBanners = asyncHandler(async (req, res) => {
  const banners = await Banner.find().sort({ priority: -1, createdAt: -1 });
  res.status(200).json(banners);
});

// Get a single banner by ID
export const getBannerById = asyncHandler(async (req, res) => {
  const banner = await Banner.findById(req.params.id);
  if (!banner) {
    res.status(404);
    throw new Error("Banner not found");
  }
  res.status(200).json(banner);
});

// Update a banner
export const updateBanner = asyncHandler(async (req, res) => {
  const { title, subtitle, image, ctaText, ctaLink, startDate, endDate, priority, tags } = req.body;

  const banner = await Banner.findById(req.params.id);
  if (!banner) {
    res.status(404);
    throw new Error("Banner not found");
  }

  banner.title = title || banner.title;
  banner.subtitle = subtitle || banner.subtitle;
  banner.image = image || banner.image;
  banner.ctaText = ctaText || banner.ctaText;
  banner.ctaLink = ctaLink || banner.ctaLink;
  banner.startDate = startDate || banner.startDate;
  banner.endDate = endDate || banner.endDate;
  banner.priority = priority || banner.priority;
  banner.tags = tags || banner.tags;

  const updatedBanner = await banner.save();
  res.status(200).json(updatedBanner);
});

// Delete a banner
export const deleteBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findByIdAndDelete(req.params.id);
  if (!banner) {
    res.status(404);
    throw new Error("Banner not found");
  }
  res.status(200).json({ message: "Banner deleted successfully" });
});