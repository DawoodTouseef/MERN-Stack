import { Box, Grid, Stack } from "@mui/material";
import Loader from "../../components/Loader";
import Message from "../../components/Message";
import DocumentTitle from "../../components/DocumentTitle";
import ProductTabs from "./ProductTabs";
import SimilarProducts from "../../components/SimilarProducts";
import useProductLogic from "./hooks/useProductLogic";
import ProductImageGallery from "./components/ProductImageGallery";
import ProductInfo from "./components/ProductInfo";
import ProductActions from "./components/ProductActions";
import ProductSpecifications from "./components/ProductSpecifications";

const ProductDetails = () => {
  const {
    product,
    isLoading,
    error,
    qty,
    setQty,
    selectedOptions,
    selectedVariant,
    handleOptionSelect,
    addToCartHandler,
    addToShippingHandler,
    getCurrentImages,
    getCurrentStock,
    isInStock,
    getCurrentPrice,
    availableOptions,
    userInfo,
    taxInfo,
    offerpercent,
    hasVariants,
    formatVariantAttributes,
    getVariantSku,
    getVariantShippingDetails,
    rating,
    numReviews,
    getVariantPrice,
    isOwnProduct,
    getCurrentName,
    getCurrentDescription,
    getCurrentSpecifications
  } = useProductLogic();

  return (
    <DocumentTitle title={`${getCurrentName() || "Product"} - Details`}>
      <Box sx={{ minHeight: "100vh", py: 4, bgcolor: "#f3f4f6" }}>
        <Box sx={{ maxWidth: "1280px", mx: "auto" }}>
          {isLoading ? (
            <Loader />
          ) : error ? (
            <Message variant="danger">{error?.data?.message || error.message}</Message>
          ) : (
            <>
              <Grid container spacing={4} sx={{ px: { xs: 2, md: 4 } }}>
                {/* Product Media */}
                <Grid xs={12} md={6}>
                  <ProductImageGallery
                    images={getCurrentImages()}
                    selectedVariant={selectedVariant}
                    isInStock={isInStock()}
                    productName={product.name}
                  />
                </Grid>

                {/* Product Info & Actions */}
                <ProductInfo
                  product={product}
                  isInStock={isInStock()}
                  rating={product.rating}
                  numReviews={product.numReviews}
                  availableOptions={availableOptions}
                  selectedOptions={selectedOptions}
                  handleOptionSelect={handleOptionSelect}
                  selectedVariant={selectedVariant}
                  formatVariantAttributes={formatVariantAttributes}
                  getVariantSku={getVariantSku}
                  getVariantShippingDetails={getVariantShippingDetails}
                  hasVariants={hasVariants}
                  currentPrice={getCurrentPrice()}
                  offerpercent={offerpercent}
                  taxInfo={taxInfo}
                  getVariantPrice={getVariantPrice}
                  getCurrentName={getCurrentName}
                  getCurrentDescription={getCurrentDescription}
                  getCurrentSpecifications={getCurrentSpecifications}
                />


                <ProductActions
                  product={product}
                  currentPrice={getCurrentPrice()}
                  isInStock={isInStock()}
                  qty={qty}
                  setQty={setQty}
                  currentStock={getCurrentStock()}
                  hasVariants={hasVariants}
                  selectedVariant={selectedVariant}
                  addToCartHandler={addToCartHandler}
                  addToShippingHandler={addToShippingHandler}
                  isOwnProduct={false}
                />
              </Grid>

              {/* Product Specifications */}
              {getCurrentSpecifications() && (
                <Grid xs={12} sx={{ mt: 4 }}>
                  <ProductSpecifications specifications={getCurrentSpecifications()} />
                </Grid>
              )}


              {/* Product Reviews */}
              <Grid xs={12}>
                <ProductTabs
                  userInfo={userInfo}
                  product={product}
                />
              </Grid>

              {/* Similar Products */}
              <SimilarProducts productId={product._id} limit={6} />
            </>
          )}
        </Box>
      </Box>
    </DocumentTitle >
  );
};

export default ProductDetails;