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
            <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold", borderBottom: "1px solid #eee", pb: 1 }}>
                Select Options
            </Typography>

            {Object.entries(availableOptions).map(([optionName, values]) => (
                <Box key={optionName} sx={{ mb: 2.5 }}>
                    <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600, textTransform: 'capitalize' }}>
                        {optionName}:
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                        {values.map((value) => (
                            <Chip
                                key={value}
                                label={value}
                                onClick={() => handleOptionSelect(optionName, value)}
                                color={selectedOptions[optionName] === value ? "primary" : "default"}
                                variant={selectedOptions[optionName] === value ? "filled" : "outlined"}
                                sx={{
                                    cursor: "pointer",
                                    mb: 1,
                                    px: 1,
                                    height: 38,
                                    borderRadius: "8px",
                                    fontSize: "0.9rem",
                                    fontWeight: selectedOptions[optionName] === value ? 700 : 400,
                                    border: selectedOptions[optionName] === value ? 'none' : '1px solid #d1d5db',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: 2,
                                        bgcolor: selectedOptions[optionName] === value ? "primary.main" : "#f3f4f6"
                                    },
                                    transition: 'all 0.2s ease'
                                }}
                            />
                        ))}
                    </Stack>
                </Box>
            ))}

            {/* Selected Variant Info Panel */}
            {selectedVariant && (
                <Box sx={{
                    mt: 3,
                    p: 2.5,
                    bgcolor: "#f8fafc",
                    borderRadius: 3,
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}>
                    <Typography variant="subtitle2" color="primary" gutterBottom fontWeight="bold" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                        Currently Selected
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: "#1e293b", mb: 0.5 }}>
                        {formatVariantAttributes(selectedVariant)}
                    </Typography>

                    <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                        <Typography variant="caption" sx={{ color: "text.secondary", bgcolor: "#eee", px: 1, py: 0.5, borderRadius: 1 }}>
                            SKU: {getVariantSku(selectedVariant) || "N/A"}
                        </Typography>

                        {selectedVariant.countInStock < 10 && selectedVariant.countInStock > 0 && (
                            <Typography variant="caption" sx={{ color: "#b91c1c", fontWeight: 700 }}>
                                Only {selectedVariant.countInStock} left in stock!
                            </Typography>
                        )}
                    </Stack>

                    {/* Shipping Info */}
                    {getVariantShippingDetails && getVariantShippingDetails(selectedVariant).weight && (
                        <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                                Shipping Weight: <b>{getVariantShippingDetails(selectedVariant).weight}kg</b>
                            </Typography>
                        </Box>
                    )}
                </Box>
            )}

            {/* Warning when not all options are selected */}
            {!selectedVariant && Object.keys(availableOptions).length > 0 && (
                <Box sx={{ mt: 2, p: 1.5, bgcolor: "#fff7ed", borderRadius: 2, border: '1px solid #ffedd5' }}>
                    <Typography variant="body2" color="#9a3412" fontWeight={500}>
                        Please select all options to see exact pricing and availability.
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

export default ProductVariantSelector;
