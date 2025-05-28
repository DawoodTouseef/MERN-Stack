import AddressModel from "../models/AddressModel.js"
import User from "../models/userModel.js";

// Create a new address
export const createAddress = async (req, res) => {
  try {
    const { street, city, postalCode, country, state } = req.body;
    const newAddress = new AddressModel({
      user: req.user._id,
      street,
      city,
      postalCode,
      country,
      state,
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
    const addresses = await AddressModel.find({ user: req.user._id });
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
    const { address, city, postalCode, country, state } = req.body;
    addressDoc.address = address || addressDoc.address;
    addressDoc.city = city || addressDoc.city;
    addressDoc.postalCode = postalCode || addressDoc.postalCode;
    addressDoc.country = country || addressDoc.country;
    addressDoc.state = state || addressDoc.state;
    const updated = await addressDoc.save();
    res.json(updated);
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


