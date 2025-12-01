import express from "express";
import formidable from "express-formidable";
const router = express.Router();

// controllers
import {
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
  getProductVariant
} from "../controllers/productController.js";
import { authenticate, authorizeVendor } from "../middlewares/authMiddleware.js";
import { searchLimiter } from "../middlewares/rateLimitMiddleware.js";
import checkId from "../middlewares/checkId.js";

router
  .route("/")
  .get(fetchProducts)
  .post(authenticate, authorizeVendor, formidable(), addProduct);

router.route("/allproducts").get(fetchAllProducts);

// Special routes that should be defined BEFORE the :id route
router.get("/top", fetchTopProducts);
router.get("/new", fetchNewProducts);
router.get('/flash-sales', getFlashSales);
router.get('/trending', getTrendingProducts);

// Review routes
router.route("/:id/reviews").post(authenticate, checkId, addProductReview).get(getProductReviews);

// Enhanced review routes
router.route("/reviews/:reviewId").put(authenticate, updateReview);
router.route("/reviews/vote").post(authenticate, voteOnReview);
router.route("/reviews/report").post(authenticate, reportReview);
router.route("/reviews/vendor-response").post(authenticate, addVendorResponse);

// Product ID routes (must be last to avoid conflicts with special routes)
router
  .route("/:id")
  .get(fetchProductById)
  .put(authenticate, authorizeVendor, formidable(), updateProductDetails)
  .delete(authenticate, authorizeVendor, removeProduct);

// Product variant route
router.get('/:productId/variants/:variantId', getProductVariant);

router.route("/filtered-products").post(filterProducts);

// Advanced search endpoints
router.route("/search/advanced").get(searchLimiter, advancedSearch);
router.route("/search/faceted").get(searchLimiter, facetedSearch);
router.route("/search/suggestions").get(searchLimiter, getSearchSuggestions);

export default router;