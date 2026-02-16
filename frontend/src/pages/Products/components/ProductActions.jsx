import { Card, CardContent, Typography, FormControl, InputLabel, Select, MenuItem, Button, alpha } from "@mui/material";
import { FaShoppingCart, FaEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import MultiCurrencyPriceDisplay from "../../../components/MultiCurrencyPriceDisplay";

const ProductActions = ({
    product,
    currentPrice,
    isInStock,
    qty,
    setQty,
    currentStock,
    hasVariants,
    selectedVariant,
    addToCartHandler,
    addToShippingHandler,
    isOwnProduct,
    userInfo
}) => {
    const navigate = useNavigate();

    return (
        <Card
            elevation={4}
            sx={{
                p: 3,
                bgcolor: "#fff",
                borderRadius: 3,
                boxShadow: "0 2px 12px #ec489933",
            }}
        >
            <CardContent>
                {isOwnProduct ? (
                    <>
                        <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
                            Manage Product
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            You are the owner of this product.
                        </Typography>
                        <Button
                            variant="contained"
                            fullWidth
                            size="large"
                            sx={{
                                borderRadius: 2,
                                fontWeight: "bold",
                                mb: 2,
                                py: 1.5,
                                textTransform: "none",
                                fontSize: "1.1rem",
                                background: 'linear-gradient(45deg, #6366f1 30%, #8b5cf6 90%)',
                                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.39)',
                                "&:hover": {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 6px 20px rgba(99, 102, 241, 0.23)',
                                    filter: 'brightness(1.1)'
                                },
                            }}
                            onClick={() => {
                                const updatePath = userInfo?.role === "vendor"
                                    ? `/vendor/product/update/${product._id}`
                                    : userInfo?.role === "seller"
                                        ? `/seller/product/update/${product._id}`
                                        : `/admin/product/update/${product._id}`;
                                navigate(updatePath);
                            }}
                        >
                            <FaEdit style={{ marginRight: 8 }} />
                            Edit Product
                        </Button>
                    </>
                ) : (
                    <>
                        <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
                            Buy Now
                        </Typography>
                        <MultiCurrencyPriceDisplay product={{ ...product, price: currentPrice }} />
                        <Typography variant="body2" sx={{ mb: 2, mt: 1 }}>
                            {isInStock ? (
                                <span style={{ color: "#22c55e" }}>In Stock</span>
                            ) : (
                                <span style={{ color: "#ef4444" }}>Out of Stock</span>
                            )}
                        </Typography>
                        {isInStock && (
                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel id="qty-label">Quantity</InputLabel>
                                <Select
                                    labelId="qty-label"
                                    value={qty}
                                    label="Quantity"
                                    onChange={(e) => setQty(Number(e.target.value))}
                                    sx={{ bgcolor: "#f5f5f5", borderRadius: 2 }}
                                >
                                    {[...Array(Math.min(10, currentStock)).keys()].map((x) => (
                                        <MenuItem key={x + 1} value={x + 1}>
                                            {x + 1}
                                        </MenuItem>
                                    ))}
                                </Select>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    {currentStock} available
                                </Typography>
                            </FormControl>
                        )}
                        <Button
                            variant="contained"
                            fullWidth
                            size="large"
                            sx={{
                                borderRadius: 2,
                                fontWeight: "bold",
                                mb: 2,
                                py: 1.5,
                                textTransform: "none",
                                fontSize: "1.1rem",
                                background: 'linear-gradient(45deg, #6366f1 30%, #8b5cf6 90%)',
                                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.39)',
                                "&:hover": {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 6px 20px rgba(99, 102, 241, 0.23)',
                                    filter: 'brightness(1.1)'
                                },
                            }}
                            disabled={!isInStock || (hasVariants && !selectedVariant)}
                            onClick={addToCartHandler}
                        >
                            <FaShoppingCart style={{ marginRight: 8 }} />
                            Add To Cart
                        </Button>
                        <Button
                            variant="outlined"
                            fullWidth
                            size="large"
                            sx={{
                                borderRadius: 2,
                                fontWeight: "bold",
                                py: 1.5,
                                textTransform: "none",
                                fontSize: "1.1rem",
                                borderColor: alpha('#6366f1', 0.5),
                                color: '#6366f1',
                                "&:hover": {
                                    borderColor: '#6366f1',
                                    bgcolor: alpha('#6366f1', 0.05),
                                    transform: 'translateY(-2px)'
                                },
                            }}
                            disabled={!isInStock || (hasVariants && !selectedVariant)}
                            onClick={addToShippingHandler}
                        >
                            Buy Now
                        </Button>
                    </>
                )}
            </CardContent>
        </Card>
    );
};

export default ProductActions;
