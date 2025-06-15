import AddressModel from "../models/AddressModel.js";
import User from "../models/userModel.js";

// Create a new address
export const createAddress = async (req, res) => {
  try {
    const {
      fullName,
      phone,
      street,
      city,
      state,
      postalCode,
      country,
      label,
      isDefault,
      location,
    } = req.body;

    // If isDefault is true, unset other default addresses for the user
    if (isDefault) {
      await AddressModel.updateMany(
        { user: req.user._id, isDefault: true },
        { isDefault: false }
      );
    }

    const newAddress = new AddressModel({
      user: req.user._id,
      fullName,
      phone,
      street,
      city,
      state,
      postalCode,
      country,
      label,
      isDefault,
      location,
    });

    const savedAddress = await newAddress.save();
    res.status(201).json(savedAddress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all addresses for a specific user
export const getUserAddresses = async (req, res) => {
  try {
    const addresses = await AddressModel.find({ user: req.user._id }).sort({
      isDefault: -1, // Default addresses appear first
      createdAt: -1, // Newest addresses appear first
    });
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single address by ID
export const getAddressById = async (req, res) => {
  try {
    const address = await AddressModel.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }
    res.json(address);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update an address
export const updateAddressById = async (req, res) => {
  try {
    const addressDoc = await AddressModel.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!addressDoc) {
      return res.status(404).json({ message: "Address not found" });
    }

    const {
      fullName,
      phone,
      street,
      city,
      state,
      postalCode,
      country,
      label,
      isDefault,
      location,
    } = req.body;

    // If isDefault is true, unset other default addresses for the user
    if (isDefault) {
      await AddressModel.updateMany(
        { user: req.user._id, isDefault: true },
        { isDefault: false }
      );
    }

    addressDoc.fullName = fullName || addressDoc.fullName;
    addressDoc.phone = phone || addressDoc.phone;
    addressDoc.street = street || addressDoc.street;
    addressDoc.city = city || addressDoc.city;
    addressDoc.state = state || addressDoc.state;
    addressDoc.postalCode = postalCode || addressDoc.postalCode;
    addressDoc.country = country || addressDoc.country;
    addressDoc.label = label || addressDoc.label;
    addressDoc.isDefault = isDefault !== undefined ? isDefault : addressDoc.isDefault;
    addressDoc.location = location || addressDoc.location;

    const updatedAddress = await addressDoc.save();
    res.json(updatedAddress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete an address
export const deleteAddress = async (req, res) => {
  try {
    const address = await AddressModel.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }
    res.json({ message: "Address deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};