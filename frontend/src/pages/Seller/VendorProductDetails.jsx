import { Box, Grid, Button, Stack } from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from "react-router-dom";
import Loader from "../../components/Loader";
import Message from "../../components/Message";
import DocumentTitle from "../../components/DocumentTitle";
import useProductLogic from "../Products/hooks/useProductLogic";
import ProductImageGallery from "../Products/components/ProductImageGallery";
import ProductInfo from "../Products/components/ProductInfo";
import ProductActions from "../Products/components/ProductActions";
import ProductSpecifications from "../Products/components/ProductSpecifications";

const VendorProductDetails = () => {
    const navigate = useNavigate();
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
        userInfo,
        getCurrentName,
        getCurrentDescription,
        getCurrentSpecifications
    } = useProductLogic();

    return (
        <DocumentTitle title={`${getCurrentName() || product?.name || "Product"} - Vendor Details`}>
            <Box sx={{ minHeight: "100vh", py: 4, bgcolor: "#f3f4f6" }}>
                <Box sx={{ maxWidth: "1280px", mx: "auto", px: { xs: 2, md: 4 } }}>
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate(-1)}
                        sx={{ mb: 3 }}
                    >
                        Back to Inventory
                    </Button>

                    {isLoading ? (
                        <Loader />
                    ) : error ? (
                        <Message variant="danger">{error?.data?.message || error.message}</Message>
                    ) : (
                        <Grid container spacing={4}>
                            {/* Product Media */}
                            <Grid size={{ xs: 12, md: 6 }}>
                                <ProductImageGallery
                                    images={getCurrentImages()}
                                    selectedVariant={selectedVariant}
                                    isInStock={isInStock()}
                                    productName={product.name}
                                />
                            </Grid>

                            {/* Info & Actions */}
                            <Grid size={{ xs: 12, md: 5 }}>
                                <Stack spacing={3}>
                                    <ProductInfo
                                        product={product}
                                        isInStock={isInStock()}
                                        rating={rating}
                                        numReviews={numReviews}
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

                                    <Box sx={{ position: { md: "sticky" }, top: 20, zIndex: 10 }}>
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
                                            isOwnProduct={true}
                                            userInfo={userInfo}
                                        />
                                    </Box>
                                </Stack>
                            </Grid>

                            {/* Product Specifications */}
                            {product.specifications && (
                                <Grid size={{ xs: 12 }} sx={{ mt: 4 }}>
                                    <ProductSpecifications specifications={product.specifications} />
                                </Grid>
                            )}
                        </Grid>
                    )}
                </Box>
            </Box>
        </DocumentTitle>
    );
};

export default VendorProductDetails;
