import { Paper, Box, CardMedia, Stack, Chip, alpha } from "@mui/material";

const ProductImageGallery = ({ images, selectedVariant, isInStock, productName }) => {
    const currentImages = images || [];

    return (
        <Box sx={{ position: "sticky", top: 100 }}>
            {/* Main Image Display */}
            <Paper
                elevation={0}
                sx={{
                    mb: 2,
                    borderRadius: 4,
                    overflow: "hidden",
                    border: "1px solid",
                    borderColor: "divider",
                    position: "relative",
                    aspectRatio: "1/1",
                    bgcolor: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }}
            >
                <Box
                    component="img"
                    src={currentImages[0] || "/placeholder.png"}
                    alt={productName}
                    sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        p: 2,
                        transition: "transform 0.3s ease",
                        "&:hover": {
                            transform: "scale(1.05)"
                        }
                    }}
                />

                {!isInStock && (
                    <Box
                        sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            bgcolor: "rgba(255, 255, 255, 0.7)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            zIndex: 10
                        }}
                    >
                        <Paper
                            elevation={3}
                            sx={{
                                py: 1,
                                px: 3,
                                borderRadius: 8,
                                bgcolor: "error.main",
                                color: "white",
                                fontWeight: "bold"
                            }}
                        >
                            OUT OF STOCK
                        </Paper>
                    </Box>
                )}
            </Paper>

            {/* Thumbnail Strip */}
            {currentImages.length > 1 && (
                <Stack
                    direction="row"
                    spacing={2}
                    sx={{
                        overflowX: "auto",
                        pb: 1,
                        "&::-webkit-scrollbar": { height: 6 },
                        "&::-webkit-scrollbar-thumb": {
                            bgcolor: "rgba(0,0,0,0.1)",
                            borderRadius: 4
                        }
                    }}
                >
                    {currentImages.map((img, index) => (
                        <Paper
                            key={index}
                            elevation={0}
                            sx={{
                                minWidth: 80,
                                width: 80,
                                height: 80,
                                borderRadius: 3,
                                cursor: "pointer",
                                border: "2px solid",
                                borderColor: "transparent",
                                overflow: "hidden",
                                transition: "all 0.2s",
                                "&:hover": {
                                    borderColor: "primary.light"
                                }
                            }}
                        >
                            <Box
                                component="img"
                                src={img}
                                alt={`Thumbnail ${index + 1}`}
                                sx={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover"
                                }}
                            />
                        </Paper>
                    ))}
                </Stack>
            )}
        </Box>
    );
};

export default ProductImageGallery;
