import Offer from "../models/offersModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";

// Create a new offer
export const createOffer = asyncHandler(async (req, res) => {
  try {
    const {
      title,
      description,
      offerType,
      discountValue,
      discountUnit,
      products,
      categories,
      brand,
      bankName,
      promoCode,
      minCartValue,
      startTime,
      endTime,
    } = req.body;
    let brands=brand || null;
    const offer = new Offer({
      title,
      description,
      offerType,
      discountValue,
      discountUnit,
      products,
      categories,
      brand:brands,
      bankName,
      promoCode,
      minCartValue,
      startTime,
      endTime,
      createdBy: req.user._id,
    });

    const savedOffer = await offer.save();
    res.status(201).json(savedOffer);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to create offer" });
  }
});

// Get all offers
export const getOffers = asyncHandler(async (req, res) => {
  try {
    const offers = await Offer.find()
    .populate('products')
    .populate('categories')
    .populate('brand');
    
    res.json(offers);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch offers" });
  }
});

// Get a single offer by ID
export const getOfferById = asyncHandler(async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id)
    .populate('products')
    .populate('categories');
    if (!offer) {
      res.status(404).json({ message: "Offer not found" });
      return;
    }
    res.status(200).json(offer);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch offer" });
  }
});

// Update an offer
export const updateOffer = asyncHandler(async (req, res) => {
  try {
    const {
      title,
      description,
      offerType,
      discountValue,
      discountUnit,
      products,
      categories,
      brand,
      bankName,
      promoCode,
      minCartValue,
      startTime,
      endTime,
    } = req.body;

    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      res.status(404).json({ message: "Offer not found" });
      return;
    }

    offer.title = title || offer.title;
    offer.description = description || offer.description;
    offer.offerType = offerType || offer.offerType;
    offer.discountValue = discountValue || offer.discountValue;
    offer.discountUnit = discountUnit || offer.discountUnit;
    offer.products = products || offer.products;
    offer.categories = categories || offer.categories;
    offer.brand = brand || offer.brand;
    offer.bankName = bankName || offer.bankName;
    offer.promoCode = promoCode || offer.promoCode;
    offer.minCartValue = minCartValue || offer.minCartValue;
    offer.startTime = startTime || offer.startTime;
    offer.endTime = endTime || offer.endTime;

    const updatedOffer = await offer.save();
    res.status(200).json(updatedOffer);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to update offer" });
  }
});

// Delete an offer
export const deleteOffer = asyncHandler(async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      res.status(404).json({ message: "Offer not found" });
      return;
    }

    await Offer.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Offer deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to delete offer" });
  }
});