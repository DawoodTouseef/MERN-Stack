import asyncHandler from "../middlewares/asyncHandler.js";
import Product from "../models/productModel.js";

const addProduct = asyncHandler(async (req, res) => {
  try {

    const { name, description, price, category, quantity, brand, warrantyPeriod, returnPolicy, tags, countInStock } = req.fields;

    // Validation
    switch (true) {
      case !name:
        return res.json({ error: "Name is required" });
      case !brand:
        return res.json({ error: "Brand is required" });
      case !description:
        return res.json({ error: "Description is required" });
      case !price:
        return res.json({ error: "Price is required" });
      case !category:
        return res.json({ error: "Category is required" });
      case !quantity:
        return res.json({ error: "Quantity is required" });
    }

    // Parse media
    const mediaArray = [];
    Object.keys(req.fields).forEach((key) => {
      const mediaMatch = key.match(/media\[(\d+)\]\[(\w+)\]/);
      if (mediaMatch) {
        const index = parseInt(mediaMatch[1]);
        const field = mediaMatch[2];
        if (!mediaArray[index]) mediaArray[index] = {};
        mediaArray[index][field] = req.fields[key];
      }
    });

    // Parse specifications
    const specifications = {};
    Object.keys(req.fields).forEach((key) => {
      const specMatch = key.match(/specifications\[(.+)\]/);
      if (specMatch) {
        const specKey = specMatch[1];
        specifications[specKey] = req.fields[key];
      }
    });

    // Parse variants
    const variantsArray = [];
    Object.keys(req.fields).forEach((key) => {
      const variantMatch = key.match(/variants\[(\d+)\]\[(\w+)\]/);
      if (variantMatch) {
        const index = parseInt(variantMatch[1]);
        const field = variantMatch[2];
        if (!variantsArray[index]) variantsArray[index] = {};
        variantsArray[index][field] = req.fields[key];
      }
    });

    const productData = {
      name,
      description,
      price: Number(price),
      category,
      quantity: Number(quantity),
      brand,
      warrantyPeriod,
      returnPolicy,
      tags: tags ? (Array.isArray(tags) ? tags : [tags]) : [],
      media: mediaArray.filter(item => item && item.type && item.url), // Ensure valid media entries
      specifications,
      variants: variantsArray.filter(item => item && Object.keys(item).length > 0), // Ensure valid variants
      user: req.fields.user,
      countInStock: Number(countInStock),
    };


    const product = new Product(productData)
    .populate("category")
    .populate('brand');
    await product.save();
    res.json(product);
  } catch (error) {
    console.error("Error:", error);
    res.status(400).json(error.message);
  }
});


const updateProductDetails = asyncHandler(async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      quantity,
      brand,
      warrantyPeriod,
      returnPolicy,
      countInStock,
    } = req.fields;

    // Validate product ID
    const productId = req.params.id;
    

    // Fetch the existing product
    const existingProduct = await Product.findById(productId).populate("category").populate("brand");
    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Parse specifications
    const specifications = {};
    Object.keys(req.fields).forEach((key) => {
      const specMatch = key.match(/specifications\[(.+)\]/);
      if (specMatch) {
        const specKey = specMatch[1];
        specifications[specKey] = req.fields[key];
      }
    });

    // Parse variants
    const variantsArray = [];
    Object.keys(req.fields).forEach((key) => {
      const variantMatch = key.match(/variants\[(\d+)\]\[(\w+)\]/);
      if (variantMatch) {
        const index = parseInt(variantMatch[1]);
        const field = variantMatch[2];
        if (!variantsArray[index]) variantsArray[index] = {};
        variantsArray[index][field] = req.fields[key];
      }
    });
    const tags=[];
    Object.keys(req.fields).forEach((key) => {
      const specMatch = key.match(/tags\[(.+)\]/);
      if (specMatch) {
        tags.push(req.fields[key]);
      }
    });
        const mediaArray = [];
    Object.keys(req.fields).forEach((key) => {
      const mediaMatch = key.match(/media\[(\d+)\]\[(\w+)\]/);
      if (mediaMatch) {
        const index = parseInt(mediaMatch[1]);
        const field = mediaMatch[2];
        if (!mediaArray[index]) mediaArray[index] = {};
        mediaArray[index][field] = req.fields[key];
      }
    });
    
    // Construct updated product data
    const updatedProductData = {
      name: name || existingProduct.name,
      description: description || existingProduct.description,
      price: price !== undefined ? Number(price) : existingProduct.price,
      category: category || existingProduct.category,
      quantity: quantity !== undefined ? Number(quantity) : existingProduct.quantity,
      brand: brand || existingProduct.brand,
      warrantyPeriod: warrantyPeriod || existingProduct.warrantyPeriod,
      returnPolicy: returnPolicy || existingProduct.returnPolicy,
      tags: tags ? (Array.isArray(tags) ? tags : [tags]) : existingProduct.tags,
      media: mediaArray.filter(item => item && item.type && item.url),
      specifications: Object.keys(specifications).length > 0 ? specifications : existingProduct.specifications,
      variants: variantsArray.length > 0 ? variantsArray : existingProduct.variants,
      countInStock: countInStock !== undefined ? Number(countInStock) : existingProduct.countInStock,
    };
    // Update the product
    const updatedProduct = await Product.findByIdAndUpdate(productId, updatedProductData, { new: true })
      .populate("category")
      .populate("brand");
  
    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Failed to update product" });
  }
});

const removeProduct = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id)
    .populate("category")
      .populate('brand');
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

const fetchProducts = asyncHandler(async (req, res) => {
  try {
    const pageSize = 6;
    const keyword = req.query.keyword
      ? {
          name: {
            $regex: req.query.keyword,
            $options: "i",
          },
        }
      : {};

    const count = await Product.countDocuments({ ...keyword })
    .populate('category')
    .populate('brand');
    const products = await Product.find({ ...keyword }).limit(pageSize).populate("category")
      .populate('brand');

    res.json({
      products,
      page: 1,
      pages: Math.ceil(count / pageSize),
      hasMore: false,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});

const fetchProductById = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category').populate('brand');
    if (product) {
      return res.json(product);
    } else {
      res.status(404);
      throw new Error("Product not found");
    }
  } catch (error) {
    console.error(error);
    res.status(404).json({ error: "Product not found" });
  }
});

const fetchAllProducts = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find({})
      .populate("category")
      .populate('brand')
      .limit(12)
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});

const addProductReview = asyncHandler(async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id)
    .populate("category")
      .populate('brand');

    if (product) {
      const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
      );

      const review = {
        name: req.user.username,
        rating: Number(rating),
        comment,
        user: req.user._id,
      };

      product.reviews.push(review);
      product.numReviews = product.reviews.length;
      product.rating =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length;

      await product.save();
      res.status(201).json({ message: "Review added" });
    } else {
      res.status(404);
      throw new Error("Product not found");
    }
  } catch (error) {
    console.error(error);
    res.status(400).json(error.message);
  }
});

const fetchTopProducts = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find({}).sort({ rating: -1 }).limit(4)
    .populate('category').populate('brand');
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(400).json(error.message);
  }
});

const fetchNewProducts = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find().sort({ _id: -1 }).limit(5)
    .populate('category').populate('brand');
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(400).json(error.message);
  }
});

const filterProducts = asyncHandler(async (req, res) => {
  try {
    const { checked, radio } = req.body;
    let args = {};
    if (checked.length > 0) args.category = checked;
    if (radio.length) args.price = { $gte: radio[0], $lte: radio[1] };
    const products = await Product.find(args)
    .populate('category').populate('brand');
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});

export {
  addProduct,
  updateProductDetails,
  removeProduct,
  fetchProducts,
  fetchProductById,
  fetchAllProducts,
  addProductReview,
  fetchTopProducts,
  fetchNewProducts,
  filterProducts,
};