import { Box, Typography, Stack, Chip } from "@mui/material";

const ProductVariantSelector = ({
    hasVariants,
    availableOptions,
    selectedOptions,
    handleOptionSelect,
    selectedVariant,
    formatVariantAttributes,
    getVariantSku,
    getVariantShippingDetails
}) => {
    if (!hasVariants) return null;

    return (
        <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
                Select Options:
            </Typography>

            {/* Color Selector */}
            {availableOptions.colors.length > 0 && (
                <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                        Color:
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                        {availableOptions.colors.map((color) => (
                            <Chip
                                key={color}
                                label={color}
                                onClick={() => handleOptionSelect('color', color)}
                                color={selectedOptions.color === color ? "primary" : "default"}
                                variant={selectedOptions.color === color ? "filled" : "outlined"}
                                sx={{
                                    cursor: "pointer",
                                    mb: 1,
                                    minWidth: 40,
                                    height: 36,
                                    '&:hover': {
                                        transform: 'scale(1.05)',
                                        boxShadow: 2
                                    },
                                    transition: 'all 0.2s ease'
                                }}
                            />
                        ))}
                    </Stack>
                </Box>
            )}

            {/* Size Selector */}
            {availableOptions.sizes.length > 0 && (
                <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                        Size:
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                        {availableOptions.sizes.map((size) => (
                            <Chip
                                key={size}
                                label={size}
                                onClick={() => handleOptionSelect('size', size)}
                                color={selectedOptions.size === size ? "primary" : "default"}
                                variant={selectedOptions.size === size ? "filled" : "outlined"}
                                sx={{
                                    cursor: "pointer",
                                    mb: 1,
                                    minWidth: 40,
                                    height: 36,
                                    '&:hover': {
                                        transform: 'scale(1.05)',
                                        boxShadow: 2
                                    },
                                    transition: 'all 0.2s ease'
                                }}
                            />
                        ))}
                    </Stack>
                </Box>
            )}

            {/* Storage Selector */}
            {availableOptions.storages.length > 0 && (
                <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                        Storage:
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                        {availableOptions.storages.map((storage) => (
                            <Chip
                                key={storage}
                                label={storage}
                                onClick={() => handleOptionSelect('storage', storage)}
                                color={selectedOptions.storage === storage ? "primary" : "default"}
                                variant={selectedOptions.storage === storage ? "filled" : "outlined"}
                                sx={{
                                    cursor: "pointer",
                                    mb: 1,
                                    minWidth: 40,
                                    height: 36,
                                    '&:hover': {
                                        transform: 'scale(1.05)',
                                        boxShadow: 2
                                    },
                                    transition: 'all 0.2s ease'
                                }}
                            />
                        ))}
                    </Stack>
                </Box>
            )}

            {/* Selected Variant Info */}
            {selectedVariant && (
                <Box sx={{ mt: 2, p: 2, bgcolor: "#f5f5f5", borderRadius: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                        Selected: {formatVariantAttributes(selectedVariant)}
                    </Typography>
                    <Typography variant="body2">
                        SKU: {getVariantSku(selectedVariant)}
                    </Typography>
                    {selectedVariant.countInStock < 10 && selectedVariant.countInStock > 0 && (
                        <Typography variant="body2" color="warning.main">
                            Only {selectedVariant.countInStock} left in stock!
                        </Typography>
                    )}

                    {/* Shipping Info */}
                    {getVariantShippingDetails && getVariantShippingDetails(selectedVariant).weight && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                            Weight: {getVariantShippingDetails(selectedVariant).weight}kg
                        </Typography>
                    )}
                </Box>
            )}

            {/* Warning when not all options are selected */}
            {!selectedVariant && Object.keys(selectedOptions).length > 0 && (
                <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
                    Please select all options
                </Typography>
            )}
        </Box>
    );
};

export default ProductVariantSelector;
