import { Paper, Typography, Stack, Rating, Chip, Box, Divider } from "@mui/material";
import MultiCurrencyPriceDisplay from "../../../components/MultiCurrencyPriceDisplay";
import ProductVariantSelector from "./ProductVariantSelector";

const ProductInfo = ({
    product,
    isInStock,
    rating,
    numReviews,
    availableOptions,
    selectedOptions,
    handleOptionSelect,
    selectedVariant,
    formatVariantAttributes,
    getVariantSku,
    getVariantShippingDetails,
    hasVariants,
    currentPrice,
    offerpercent,
    taxInfo,
    getVariantPrice
}) => {
    return (
        <Paper
            elevation={0}
            sx={{
                p: 3,
                bgcolor: "#fff",
                borderRadius: 3,
                boxShadow: "0 2px 12px #ec489933",
            }}
        >
            <Typography
                variant="h4"
                fontWeight="bold"
                gutterBottom
                sx={{
                    color: "#18181b",
                    letterSpacing: 0.5,
                    textShadow: "1px 1px 8px #f3e7e9",
                }}
            >
                {product.name}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <Rating
                    value={Number(rating) || 0}
                    precision={0.1}
                    readOnly
                    size="medium"
                    sx={{ color: "#6366f1" }}
                />
                <Typography variant="body2" color="text.secondary">
                    {numReviews} ratings
                </Typography>
                <Chip
                    label={isInStock ? "In Stock" : "Out of Stock"}
                    color={isInStock ? "success" : "error"}
                    size="small"
                    sx={{
                        fontWeight: 600,
                        fontSize: "0.95rem",
                        borderRadius: "999px",
                        ml: 1,
                    }}
                />
            </Stack>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                Brand: <b>{product.brand?.name}</b>
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>About this item:</strong>
                <br />
                {product.description}
            </Typography>

            {/* Variant Selection */}
            <ProductVariantSelector
                hasVariants={hasVariants}
                availableOptions={availableOptions}
                selectedOptions={selectedOptions}
                handleOptionSelect={handleOptionSelect}
                selectedVariant={selectedVariant}
                formatVariantAttributes={formatVariantAttributes}
                getVariantSku={getVariantSku}
                getVariantShippingDetails={getVariantShippingDetails}
            />

            <Divider sx={{ my: 2 }} />
            <MultiCurrencyPriceDisplay product={{ ...product, price: currentPrice }} />
            {offerpercent.percentage > 0 && (
                <Typography
                    variant="body2"
                    sx={{
                        color: "#ef4444",
                        fontWeight: 500,
                        textDecoration: "line-through",
                        mt: 1,
                    }}
                >
                    Original Price: <MultiCurrencyPriceDisplay product={{ ...product, price: product.price }} showConversion={false} />
                </Typography>
            )}

            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Variant Price: <MultiCurrencyPriceDisplay product={{ ...product, price: getVariantPrice(selectedVariant) }} showConversion={false} />
            </Typography>


            {taxInfo && (
                <Box sx={{ mt: 2, p: 1, bgcolor: "#f0fdf4", borderRadius: 1, border: '1px solid #bbf7d0' }}>
                    <Typography variant="body2" color="success.main">
                        {taxInfo.isInclusive
                            ? `Includes Tax (${taxInfo.rate}%)`
                            : `+ Estimated Tax: $${taxInfo.tax} (${taxInfo.rate}%)`}
                    </Typography>
                    <Typography variant="caption" display="block" color="text.secondary">
                        based on 10001 (US)
                    </Typography>
                </Box>
            )}
        </Paper>
    );
};

export default ProductInfo;
