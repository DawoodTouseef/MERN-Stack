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
          $or: [
            { name: { $regex: req.query.keyword, $options: "i" } },
            { description: { $regex: req.query.keyword, $options: "i" } },
            { tags: { $in: [new RegExp(req.query.keyword, "i")] } }
          ]
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
    const { 
      rating, 
      comment, 
      title,
      images,
      videos,
      pros,
      cons,
      usageContext
    } = req.body;
    
    const product = await Product.findById(req.params.id)
      .populate("category")
      .populate('brand');

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Check if user already reviewed this product
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({ error: "Product already reviewed" });
    }

    // Check for verified purchase
    const Order = (await import('../models/orderModel.js')).default;
    const verifiedPurchase = await Order.findOne({
      user: req.user._id,
      'orderItems.product': req.params.id,
      orderStatus: 'Delivered',
      isPaid: true
    }).sort({ deliveredAt: -1 });

    // Calculate quality score based on review length, detail, etc.
    const qualityScore = calculateReviewQuality({
      comment,
      title,
      pros,
      cons,
      usageContext,
      hasImages: images && images.length > 0,
      hasVideos: videos && videos.length > 0
    });

    const review = {
      name: req.user.username,
      rating: Number(rating),
      comment,
      title: title || '',
      user: req.user._id,
      
      // Purchase verification
      isVerifiedPurchase: !!verifiedPurchase,
      orderId: verifiedPurchase?._id,
      purchaseDate: verifiedPurchase?.deliveredAt,
      
      // Media
      images: images || [],
      videos: videos || [],
      
      // Review details
      pros: pros || [],
      cons: cons || [],
      usageContext: usageContext || {},
      
      // Quality metrics
      qualityScore,
      moderationStatus: qualityScore < 30 ? 'pending' : 'approved'
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    
    // Calculate weighted rating (verified purchases count more)
    const weightedRating = calculateWeightedRating(product.reviews);
    product.rating = weightedRating;

    await product.save();
    
    // Track user behavior for recommendations
    const { UserBehavior } = await import('../models/recommendationModel.js');
    await trackUserBehavior({
      userId: req.user._id,
      action: 'review',
      productId: req.params.id,
      metadata: { rating, isVerifiedPurchase: !!verifiedPurchase }
    });

    res.status(201).json({ 
      message: "Review added successfully",
      review: {
        ...review,
        _id: product.reviews[product.reviews.length - 1]._id
      }
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(400).json({ error: error.message });
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

// Advanced search with multiple filters
const advancedSearch = asyncHandler(async (req, res) => {
  try {
    const {
      keyword,
      category,
      brand,
      minPrice,
      maxPrice,
      rating,
      availability,
      sortBy,
      sortOrder,
      page = 1,
      limit = 12,
      tags,
      warranty,
      returnPolicy
    } = req.query;

    // Build search query
    let searchQuery = {};

    // Text search across multiple fields
    if (keyword) {
      searchQuery.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { tags: { $in: [new RegExp(keyword, 'i')] } },
        { 'specifications.value': { $regex: keyword, $options: 'i' } }
      ];
    }

    // Category filter
    if (category && category !== 'all') {
      if (Array.isArray(category)) {
        searchQuery.category = { $in: category };
      } else {
        searchQuery.category = category;
      }
    }

    // Brand filter
    if (brand && brand !== 'all') {
      if (Array.isArray(brand)) {
        searchQuery.brand = { $in: brand };
      } else {
        searchQuery.brand = brand;
      }
    }

    // Price range filter
    if (minPrice || maxPrice) {
      searchQuery.price = {};
      if (minPrice) searchQuery.price.$gte = Number(minPrice);
      if (maxPrice) searchQuery.price.$lte = Number(maxPrice);
    }

    // Rating filter
    if (rating) {
      searchQuery.rating = { $gte: Number(rating) };
    }

    // Availability filter
    if (availability === 'inStock') {
      searchQuery.countInStock = { $gt: 0 };
    } else if (availability === 'outOfStock') {
      searchQuery.countInStock = { $lte: 0 };
    }

    // Tags filter
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      searchQuery.tags = { $in: tagArray };
    }

    // Warranty filter
    if (warranty) {
      searchQuery.warrantyPeriod = { $regex: warranty, $options: 'i' };
    }

    // Return policy filter
    if (returnPolicy === 'returnable') {
      searchQuery.returnPolicy = { $exists: true, $ne: null };
    }

    // Build sort options
    let sortOptions = {};
    switch (sortBy) {
      case 'price':
        sortOptions.price = sortOrder === 'desc' ? -1 : 1;
        break;
      case 'rating':
        sortOptions.rating = sortOrder === 'desc' ? -1 : 1;
        break;
      case 'newest':
        sortOptions.createdAt = -1;
        break;
      case 'popular':
        sortOptions.numReviews = -1;
        break;
      case 'name':
        sortOptions.name = sortOrder === 'desc' ? -1 : 1;
        break;
      default:
        sortOptions.createdAt = -1;
    }

    // Calculate pagination
    const pageSize = parseInt(limit);
    const skip = (parseInt(page) - 1) * pageSize;

    // Execute search with aggregation for better performance
    const pipeline = [
      { $match: searchQuery },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $lookup: {
          from: 'brands',
          localField: 'brand',
          foreignField: '_id',
          as: 'brand'
        }
      },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$brand', preserveNullAndEmptyArrays: true } },
      { $sort: sortOptions },
      {
        $facet: {
          products: [
            { $skip: skip },
            { $limit: pageSize }
          ],
          totalCount: [
            { $count: 'total' }
          ],
          priceRange: [
            {
              $group: {
                _id: null,
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' },
                avgPrice: { $avg: '$price' }
              }
            }
          ],
          categoryStats: [
            {
              $group: {
                _id: '$category._id',
                name: { $first: '$category.name' },
                count: { $sum: 1 }
              }
            }
          ],
          brandStats: [
            {
              $group: {
                _id: '$brand._id',
                name: { $first: '$brand.name' },
                count: { $sum: 1 }
              }
            }
          ]
        }
      }
    ];

    const [result] = await Product.aggregate(pipeline);
    
    const totalProducts = result.totalCount[0]?.total || 0;
    const totalPages = Math.ceil(totalProducts / pageSize);

    res.json({
      success: true,
      products: result.products,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalProducts,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      },
      filters: {
        priceRange: result.priceRange[0] || { minPrice: 0, maxPrice: 0, avgPrice: 0 },
        categories: result.categoryStats,
        brands: result.brandStats
      },
      searchQuery: {
        keyword,
        category,
        brand,
        minPrice,
        maxPrice,
        rating,
        availability,
        sortBy,
        sortOrder
      }
    });
  } catch (error) {
    console.error('Advanced search error:', error);
    res.status(500).json({ 
      success: false,
      error: "Advanced search failed",
      message: error.message 
    });
  }
});

// Enhanced faceted search with comprehensive filters
const facetedSearch = asyncHandler(async (req, res) => {
  try {
    const {
      keyword,
      category,
      brand,
      priceRange,
      rating,
      availability,
      delivery,
      seller,
      offers,
      features,
      sortBy = 'newest',
      sortOrder = 'desc',
      page = 1,
      limit = 24
    } = req.query;

    // Build base search query
    let searchQuery = {};

    // Text search
    if (keyword) {
      searchQuery.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { tags: { $in: [new RegExp(keyword, 'i')] } },
        { 'specifications.value': { $regex: keyword, $options: 'i' } }
      ];
    }

    // Category filter
    if (category && category.length > 0) {
      const categoryArray = Array.isArray(category) ? category : [category];
      searchQuery.category = { $in: categoryArray };
    }

    // Brand filter
    if (brand && brand.length > 0) {
      const brandArray = Array.isArray(brand) ? brand : [brand];
      searchQuery.brand = { $in: brandArray };
    }

    // Price range filter
    if (priceRange && priceRange !== 'all') {
      const [min, max] = priceRange.split('-').map(Number);
      searchQuery.price = { $gte: min, $lte: max };
    }

    // Rating filter
    if (rating && rating > 0) {
      searchQuery.rating = { $gte: Number(rating) };
    }

    // Availability filter
    if (availability && availability !== 'all') {
      if (availability === 'in_stock') {
        searchQuery.countInStock = { $gt: 0 };
      } else if (availability === 'out_of_stock') {
        searchQuery.countInStock = { $lte: 0 };
      }
    }

    // Delivery time filter
    if (delivery && delivery !== 'all') {
      switch (delivery) {
        case 'same_day':
          searchQuery.fastDelivery = true;
          break;
        case 'free_shipping':
          searchQuery.freeShipping = true;
          break;
        default:
          break;
      }
    }

    // Seller type filter
    if (seller && seller !== 'all') {
      if (seller === 'top_rated') {
        searchQuery.rating = { $gte: 4.5 };
      }
    }

    // Offers filter
    if (offers && offers.length > 0) {
      const offersArray = Array.isArray(offers) ? offers : [offers];
      const offerConditions = [];
      
      if (offersArray.includes('flash_sale')) {
        offerConditions.push({ discount: { $gt: 30 } });
      }
      if (offersArray.includes('buy_2_get_1')) {
        offerConditions.push({ bulkDiscount: { $exists: true } });
      }
      if (offersArray.includes('cashback')) {
        offerConditions.push({ cashbackOffer: { $exists: true } });
      }
      if (offersArray.includes('no_cost_emi')) {
        offerConditions.push({ emiAvailable: true });
      }
      
      if (offerConditions.length > 0) {
        searchQuery.$or = searchQuery.$or ? 
          [...(searchQuery.$or || []), ...offerConditions] : 
          offerConditions;
      }
    }

    // Features filter
    if (features && features.length > 0) {
      const featuresArray = Array.isArray(features) ? features : [features];
      searchQuery.features = { $in: featuresArray };
    }

    // Build sort options
    let sortOptions = {};
    switch (sortBy) {
      case 'price':
        sortOptions.price = sortOrder === 'desc' ? -1 : 1;
        break;
      case 'rating':
        sortOptions.rating = sortOrder === 'desc' ? -1 : 1;
        break;
      case 'newest':
        sortOptions.createdAt = -1;
        break;
      case 'popular':
        sortOptions.numReviews = -1;
        break;
      case 'name':
        sortOptions.name = sortOrder === 'desc' ? -1 : 1;
        break;
      default:
        sortOptions.createdAt = -1;
    }

    // Calculate pagination
    const pageSize = parseInt(limit);
    const skip = (parseInt(page) - 1) * pageSize;

    // Enhanced aggregation pipeline with comprehensive facets
    const pipeline = [
      { $match: searchQuery },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $lookup: {
          from: 'brands',
          localField: 'brand',
          foreignField: '_id',
          as: 'brand'
        }
      },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$brand', preserveNullAndEmptyArrays: true } },
      { $sort: sortOptions },
      {
        $facet: {
          products: [
            { $skip: skip },
            { $limit: pageSize }
          ],
          totalCount: [
            { $count: 'total' }
          ],
          // Price range facet
          priceStats: [
            {
              $group: {
                _id: null,
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' },
                avgPrice: { $avg: '$price' }
              }
            }
          ],
          // Price range buckets
          priceRanges: [
            {
              $bucket: {
                groupBy: '$price',
                boundaries: [0, 25, 50, 100, 200, 500, 10000],
                default: 'Other',
                output: {
                  count: { $sum: 1 },
                  avgPrice: { $avg: '$price' }
                }
              }
            }
          ],
          // Category facet
          categories: [
            {
              $group: {
                _id: '$category._id',
                name: { $first: '$category.name' },
                count: { $sum: 1 }
              }
            },
            { $sort: { count: -1 } },
            { $limit: 20 }
          ],
          // Brand facet
          brands: [
            {
              $group: {
                _id: '$brand._id',
                name: { $first: '$brand.name' },
                count: { $sum: 1 }
              }
            },
            { $sort: { count: -1 } },
            { $limit: 20 }
          ],
          // Rating facet
          ratings: [
            {
              $bucket: {
                groupBy: '$rating',
                boundaries: [0, 1, 2, 3, 4, 5],
                default: 'No rating',
                output: {
                  count: { $sum: 1 }
                }
              }
            }
          ],
          // Availability facet
          availability: [
            {
              $group: {
                _id: {
                  $cond: {
                    if: { $gt: ['$countInStock', 0] },
                    then: 'in_stock',
                    else: 'out_of_stock'
                  }
                },
                count: { $sum: 1 }
              }
            }
          ],
          // Features facet
          features: [
            { $unwind: { path: '$features', preserveNullAndEmptyArrays: true } },
            {
              $group: {
                _id: '$features',
                count: { $sum: 1 }
              }
            },
            { $match: { _id: { $ne: null } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
          ],
          // Offers facet
          offers: [
            {
              $group: {
                _id: null,
                flashSale: {
                  $sum: {
                    $cond: [{ $gt: ['$discount', 30] }, 1, 0]
                  }
                },
                freeShipping: {
                  $sum: {
                    $cond: [{ $eq: ['$freeShipping', true] }, 1, 0]
                  }
                },
                cashback: {
                  $sum: {
                    $cond: [{ $exists: ['$cashbackOffer'] }, 1, 0]
                  }
                },
                emi: {
                  $sum: {
                    $cond: [{ $eq: ['$emiAvailable', true] }, 1, 0]
                  }
                }
              }
            }
          ]
        }
      }
    ];

    const [result] = await Product.aggregate(pipeline);
    
    const totalProducts = result.totalCount[0]?.total || 0;
    const totalPages = Math.ceil(totalProducts / pageSize);

    res.json({
      success: true,
      products: result.products,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalProducts,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      },
      facets: {
        priceStats: result.priceStats[0] || { minPrice: 0, maxPrice: 0, avgPrice: 0 },
        priceRanges: result.priceRanges,
        categories: result.categories,
        brands: result.brands,
        ratings: result.ratings,
        availability: result.availability,
        features: result.features,
        offers: result.offers[0] || {}
      },
      appliedFilters: {
        keyword,
        category,
        brand,
        priceRange,
        rating,
        availability,
        delivery,
        seller,
        offers,
        features,
        sortBy,
        sortOrder
      }
    });
  } catch (error) {
    console.error('Faceted search error:', error);
    res.status(500).json({ 
      success: false,
      error: "Faceted search failed",
      message: error.message 
    });
  }
});
const getSearchSuggestions = asyncHandler(async (req, res) => {
  try {
    const { query, limit = 10 } = req.query;
    
    if (!query || query.length < 2) {
      return res.json({ suggestions: [] });
    }

    // Get product name suggestions
    const productSuggestions = await Product.aggregate([
      {
        $match: {
          $or: [
            { name: { $regex: query, $options: 'i' } },
            { tags: { $in: [new RegExp(query, 'i')] } }
          ]
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $lookup: {
          from: 'brands',
          localField: 'brand',
          foreignField: '_id',
          as: 'brand'
        }
      },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$brand', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          name: 1,
          price: 1,
          image: { $arrayElemAt: ['$media.url', 0] },
          category: '$category.name',
          brand: '$brand.name',
          rating: 1,
          countInStock: 1
        }
      },
      { $limit: parseInt(limit) }
    ]);

    // Get category suggestions
    const categorySuggestions = await Product.aggregate([
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: '$category' },
      {
        $match: {
          'category.name': { $regex: query, $options: 'i' }
        }
      },
      {
        $group: {
          _id: '$category._id',
          name: { $first: '$category.name' },
          count: { $sum: 1 }
        }
      },
      { $limit: 5 }
    ]);

    // Get brand suggestions
    const brandSuggestions = await Product.aggregate([
      {
        $lookup: {
          from: 'brands',
          localField: 'brand',
          foreignField: '_id',
          as: 'brand'
        }
      },
      { $unwind: '$brand' },
      {
        $match: {
          'brand.name': { $regex: query, $options: 'i' }
        }
      },
      {
        $group: {
          _id: '$brand._id',
          name: { $first: '$brand.name' },
          count: { $sum: 1 }
        }
      },
      { $limit: 5 }
    ]);

    res.json({
      success: true,
      suggestions: {
        products: productSuggestions,
        categories: categorySuggestions,
        brands: brandSuggestions
      },
      query
    });
  } catch (error) {
    console.error('Search suggestions error:', error);
    res.status(500).json({ 
      success: false,
      error: "Failed to get search suggestions" 
    });
  }
});

// Helper function to calculate review quality score
const calculateReviewQuality = (reviewData) => {
  let score = 0;
  
  // Comment length and detail (40 points max)
  if (reviewData.comment) {
    const wordCount = reviewData.comment.split(' ').length;
    if (wordCount >= 50) score += 40;
    else if (wordCount >= 20) score += 30;
    else if (wordCount >= 10) score += 20;
    else score += 10;
  }
  
  // Title presence (10 points)
  if (reviewData.title && reviewData.title.length > 5) {
    score += 10;
  }
  
  // Pros and cons (20 points)
  if (reviewData.pros && reviewData.pros.length > 0) score += 10;
  if (reviewData.cons && reviewData.cons.length > 0) score += 10;
  
  // Usage context (15 points)
  if (reviewData.usageContext && Object.keys(reviewData.usageContext).length > 0) {
    score += 15;
  }
  
  // Media attachments (15 points)
  if (reviewData.hasImages) score += 10;
  if (reviewData.hasVideos) score += 5;
  
  return Math.min(score, 100);
};

// Helper function to calculate weighted rating
const calculateWeightedRating = (reviews) => {
  if (reviews.length === 0) return 0;
  
  let totalScore = 0;
  let totalWeight = 0;
  
  reviews.forEach(review => {
    let weight = 1;
    
    // Verified purchases get higher weight
    if (review.isVerifiedPurchase) weight += 0.5;
    
    // High quality reviews get higher weight
    if (review.qualityScore >= 70) weight += 0.3;
    else if (review.qualityScore >= 50) weight += 0.1;
    
    // Recent reviews get slightly higher weight
    const daysSinceReview = (Date.now() - new Date(review.createdAt)) / (1000 * 60 * 60 * 24);
    if (daysSinceReview <= 30) weight += 0.2;
    else if (daysSinceReview <= 90) weight += 0.1;
    
    totalScore += review.rating * weight;
    totalWeight += weight;
  });
  
  return totalWeight > 0 ? totalScore / totalWeight : 0;
};

// Helper function to track user behavior
const trackUserBehavior = async ({ userId, action, productId, metadata = {} }) => {
  try {
    const { UserBehavior } = await import('../models/recommendationModel.js');
    
    const sessionId = `session_${userId}_${Date.now()}`;
    
    await UserBehavior.findOneAndUpdate(
      { user: userId },
      {
        $push: {
          events: {
            type: action,
            product: productId,
            timestamp: new Date(),
            sessionId,
            metadata
          }
        }
      },
      { upsert: true }
    );
  } catch (error) {
    console.error('Error tracking user behavior:', error);
  }
};

// Vote on review helpfulness
const voteOnReview = asyncHandler(async (req, res) => {
  try {
    const { productId, reviewId, isHelpful } = req.body;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    const review = product.reviews.id(reviewId);
    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }
    
    // Check if user already voted
    const existingVote = review.helpfulVotes.find(
      vote => vote.user.toString() === req.user._id.toString()
    );
    
    if (existingVote) {
      // Update existing vote
      if (existingVote.isHelpful !== isHelpful) {
        // Update counts
        if (existingVote.isHelpful) {
          review.helpfulCount -= 1;
          review.notHelpfulCount += 1;
        } else {
          review.notHelpfulCount -= 1;
          review.helpfulCount += 1;
        }
        existingVote.isHelpful = isHelpful;
        existingVote.votedAt = new Date();
      }
    } else {
      // Add new vote
      review.helpfulVotes.push({
        user: req.user._id,
        isHelpful,
        votedAt: new Date()
      });
      
      if (isHelpful) {
        review.helpfulCount += 1;
      } else {
        review.notHelpfulCount += 1;
      }
    }
    
    await product.save();
    
    res.json({
      message: "Vote recorded successfully",
      helpfulCount: review.helpfulCount,
      notHelpfulCount: review.notHelpfulCount
    });
  } catch (error) {
    console.error('Vote on review error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Report a review
const reportReview = asyncHandler(async (req, res) => {
  try {
    const { productId, reviewId, reason, description } = req.body;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    const review = product.reviews.id(reviewId);
    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }
    
    // Check if user already reported this review
    const existingReport = review.reports.find(
      report => report.user.toString() === req.user._id.toString()
    );
    
    if (existingReport) {
      return res.status(400).json({ error: "You have already reported this review" });
    }
    
    review.reports.push({
      user: req.user._id,
      reason,
      description: description || '',
      reportedAt: new Date()
    });
    
    review.reportCount += 1;
    
    // Auto-flag if too many reports
    if (review.reportCount >= 3 && review.moderationStatus === 'approved') {
      review.moderationStatus = 'flagged';
    }
    
    await product.save();
    
    res.json({ message: "Review reported successfully" });
  } catch (error) {
    console.error('Report review error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get reviews with filters and sorting
const getProductReviews = asyncHandler(async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sortBy = 'newest', 
      filterBy,
      rating,
      verified,
      withMedia
    } = req.query;
    
    const product = await Product.findById(req.params.id)
      .populate({
        path: 'reviews.user',
        select: 'username'
      });
    
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    let reviews = [...product.reviews];
    
    // Apply filters
    if (rating) {
      reviews = reviews.filter(r => r.rating === parseInt(rating));
    }
    
    if (verified === 'true') {
      reviews = reviews.filter(r => r.isVerifiedPurchase);
    }
    
    if (withMedia === 'true') {
      reviews = reviews.filter(r => 
        (r.images && r.images.length > 0) || 
        (r.videos && r.videos.length > 0)
      );
    }
    
    if (filterBy === 'helpful') {
      reviews = reviews.filter(r => r.helpfulCount >= 3);
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'newest':
        reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        reviews.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'helpful':
        reviews.sort((a, b) => b.helpfulCount - a.helpfulCount);
        break;
      case 'rating_high':
        reviews.sort((a, b) => b.rating - a.rating);
        break;
      case 'rating_low':
        reviews.sort((a, b) => a.rating - b.rating);
        break;
      case 'verified':
        reviews.sort((a, b) => (b.isVerifiedPurchase ? 1 : 0) - (a.isVerifiedPurchase ? 1 : 0));
        break;
      default:
        reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    
    // Apply pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedReviews = reviews.slice(startIndex, endIndex);
    
    // Calculate review statistics
    const stats = {
      totalReviews: reviews.length,
      averageRating: product.rating,
      verifiedCount: reviews.filter(r => r.isVerifiedPurchase).length,
      withMediaCount: reviews.filter(r => 
        (r.images && r.images.length > 0) || 
        (r.videos && r.videos.length > 0)
      ).length,
      ratingBreakdown: {
        5: reviews.filter(r => r.rating === 5).length,
        4: reviews.filter(r => r.rating === 4).length,
        3: reviews.filter(r => r.rating === 3).length,
        2: reviews.filter(r => r.rating === 2).length,
        1: reviews.filter(r => r.rating === 1).length
      }
    };
    
    res.json({
      success: true,
      reviews: paginatedReviews,
      stats,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(reviews.length / parseInt(limit)),
        totalReviews: reviews.length,
        hasNext: endIndex < reviews.length,
        hasPrev: startIndex > 0
      }
    });
  } catch (error) {
    console.error('Get product reviews error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update review (for editing)
const updateReview = asyncHandler(async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment, title, pros, cons, usageContext } = req.body;
    
    const product = await Product.findOne({ 'reviews._id': reviewId });
    if (!product) {
      return res.status(404).json({ error: "Review not found" });
    }
    
    const review = product.reviews.id(reviewId);
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Not authorized to edit this review" });
    }
    
    // Store edit history
    review.editHistory.push({
      editedAt: new Date(),
      previousComment: review.comment,
      previousRating: review.rating,
      reason: 'User edit'
    });
    
    // Update review fields
    review.rating = rating || review.rating;
    review.comment = comment || review.comment;
    review.title = title || review.title;
    review.pros = pros || review.pros;
    review.cons = cons || review.cons;
    review.usageContext = usageContext || review.usageContext;
    review.isEdited = true;
    
    // Recalculate quality score
    review.qualityScore = calculateReviewQuality({
      comment: review.comment,
      title: review.title,
      pros: review.pros,
      cons: review.cons,
      usageContext: review.usageContext,
      hasImages: review.images && review.images.length > 0,
      hasVideos: review.videos && review.videos.length > 0
    });
    
    // Recalculate product rating
    product.rating = calculateWeightedRating(product.reviews);
    
    await product.save();
    
    res.json({
      message: "Review updated successfully",
      review
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Add vendor response to review
const addVendorResponse = asyncHandler(async (req, res) => {
  try {
    const { productId, reviewId, comment } = req.body;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    // Check if user is vendor/admin
    if (req.user.role !== 'vendor' && req.user.role !== 'admin') {
      return res.status(403).json({ error: "Not authorized to respond to reviews" });
    }
    
    const review = product.reviews.id(reviewId);
    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }
    
    review.vendorResponse = {
      comment,
      respondedBy: req.user._id,
      respondedAt: new Date(),
      isPublic: true
    };
    
    await product.save();
    
    res.json({ message: "Response added successfully" });
  } catch (error) {
    console.error('Add vendor response error:', error);
    res.status(400).json({ error: error.message });
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
  advancedSearch,
  facetedSearch,
  getSearchSuggestions,
  voteOnReview,
  reportReview,
  getProductReviews,
  updateReview,
  addVendorResponse,
  getFlashSales,
  getTrendingProducts,
};

// @desc    Get flash sales products
// @route   GET /api/products/flash-sales
// @access  Public
const getFlashSales = asyncHandler(async (req, res) => {
  try {
    const { active = true, limit = 8 } = req.query;
    
    const currentTime = new Date();
    let flashSaleProducts = [];
    
    // Find products with active flash sale offers
    const Offer = (await import('../models/offerModel.js')).default;
    const flashOffers = await Offer.find({
      offerType: 'flash',
      ...(active === 'true' && {
        startTime: { $lte: currentTime },
        endTime: { $gt: currentTime }
      })
    }).populate('products categories');
    
    // Collect products from flash offers
    for (const offer of flashOffers) {
      // Add products directly in the offer
      if (offer.products && offer.products.length > 0) {
        flashSaleProducts.push(...offer.products.map(product => ({
          ...product.toObject(),
          flashOffer: {
            discount: offer.discountValue,
            unit: offer.discountUnit,
            endTime: offer.endTime,
            title: offer.title
          }
        })));
      }
      
      // Add products from categories in the offer
      if (offer.categories && offer.categories.length > 0) {
        const categoryProducts = await Product.find({
          category: { $in: offer.categories.map(cat => cat._id) },
          countInStock: { $gt: 0 }
        }).populate('category brand');
        
        flashSaleProducts.push(...categoryProducts.map(product => ({
          ...product.toObject(),
          flashOffer: {
            discount: offer.discountValue,
            unit: offer.discountUnit,
            endTime: offer.endTime,
            title: offer.title
          }
        })));
      }
    }
    
    // Remove duplicates and limit results
    const uniqueProducts = flashSaleProducts.filter(
      (product, index, self) => 
        index === self.findIndex(p => p._id.toString() === product._id.toString())
    );
    
    res.json(uniqueProducts.slice(0, parseInt(limit)));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get trending products
// @route   GET /api/products/trending
// @access  Public
const getTrendingProducts = asyncHandler(async (req, res) => {
  try {
    const { 
      limit = 12, 
      timeframe = '7d', 
      category, 
      latitude, 
      longitude 
    } = req.query;
    
    // Calculate date range
    const days = timeframe === '1d' ? 1 : timeframe === '7d' ? 7 : 30;
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - days);
    
    let trendingQuery = [];
    
    // If location is provided, prioritize location-based trending
    if (latitude && longitude) {
      // Import Order model dynamically
      const Order = (await import('../models/orderModel.js')).default;
      
      // Find recent orders in the area
      const locationOrders = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: dateFrom },
            orderStatus: { $in: ['Processing', 'Shipped', 'Delivered'] }
          }
        },
        { $unwind: '$orderItems' },
        {
          $group: {
            _id: '$orderItems.product',
            orderCount: { $sum: 1 },
            totalQuantity: { $sum: '$orderItems.qty' },
            totalRevenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.qty'] } }
          }
        },
        { $sort: { orderCount: -1, totalQuantity: -1 } },
        { $limit: parseInt(limit) * 2 }
      ]);
      
      trendingQuery = locationOrders.map(item => item._id);
    }
    
    // Fallback to general trending logic based on reviews and ratings
    if (trendingQuery.length === 0) {
      const trendingProducts = await Product.find({
        createdAt: { $gte: dateFrom },
        countInStock: { $gt: 0 }
      })
      .sort({ numReviews: -1, rating: -1, createdAt: -1 })
      .limit(parseInt(limit) * 2);
      
      trendingQuery = trendingProducts.map(product => product._id);
    }
    
    // Get product details
    let query = {
      _id: { $in: trendingQuery },
      countInStock: { $gt: 0 }
    };
    
    if (category) {
      query.category = category;
    }
    
    const trendingProducts = await Product.find(query)
      .populate('category', 'name')
      .populate('brand', 'name')
      .sort({ rating: -1, numReviews: -1 })
      .limit(parseInt(limit));
    
    // If not enough trending products found, fill with popular products
    if (trendingProducts.length < parseInt(limit)) {
      const remaining = parseInt(limit) - trendingProducts.length;
      const existingIds = trendingProducts.map(p => p._id);
      
      const popularProducts = await Product.find({
        _id: { $nin: existingIds },
        countInStock: { $gt: 0 },
        ...(category && { category })
      })
      .populate('category', 'name')
      .populate('brand', 'name')
      .sort({ numReviews: -1, rating: -1 })
      .limit(remaining);
      
      trendingProducts.push(...popularProducts);
    }
    
    // Add trending metadata
    const productsWithMetadata = trendingProducts.map((product, index) => ({
      ...product.toObject(),
      trendingRank: index + 1,
      trendingScore: Math.max(0.7, 1 - (index * 0.05)), // Decreasing score
      timeframe
    }));
    
    res.json(productsWithMetadata);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});