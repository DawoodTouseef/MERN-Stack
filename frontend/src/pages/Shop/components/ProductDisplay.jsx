import React, { useMemo } from 'react';
import {
    Grid,
    Box,
    Typography,
    Button,
    Paper,
    Stack,
    Skeleton,
    Fade,
    Pagination,
    alpha,
    useTheme,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Chip
} from "@mui/material";
import { FaChevronDown, FaSearch } from "react-icons/fa";
import ProductCard from "../../Products/ProductCard";

const ProductDisplay = ({
    products,
    isLoading,
    viewMode,
    page,
    handlePageChange,
    itemsPerPage,
    handleItemsPerPageChange,
    enableInfiniteScroll,
    loadingMore,
    handleAdvancedFilterClear,
    isMobile
}) => {
    const theme = useTheme();

    const totalPages = Math.ceil(products.length / itemsPerPage);
    const paginatedProducts = useMemo(() => {
        const start = (page - 1) * itemsPerPage;
        return products.slice(start, start + itemsPerPage);
    }, [products, page, itemsPerPage]);

    if (isLoading) {
        return (
            <Grid container spacing={3}>
                {[...Array(itemsPerPage)].map((_, index) => (
                    <Grid item xs={12} sm={6} lg={viewMode === 'list' ? 12 : 4} key={index}>
                        <Skeleton
                            variant="rectangular"
                            height={viewMode === 'list' ? 200 : 400}
                            sx={{ borderRadius: 3 }}
                        />
                    </Grid>
                ))}
            </Grid>
        );
    }

    if (products.length === 0) {
        return (
            <Paper
                sx={{
                    p: 6,
                    textAlign: 'center',
                    borderRadius: 3,
                    bgcolor: 'background.paper',
                    border: `1px solid ${alpha(theme.palette.divider, 0.5)}`
                }}
            >
                <Box sx={{
                    width: 80, height: 80, borderRadius: '50%',
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    mx: 'auto', mb: 3
                }}>
                    <FaSearch style={{ color: theme.palette.primary.main, fontSize: '2rem' }} />
                </Box>
                <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>No products found</Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    Try adjusting your filters or search terms.
                </Typography>
                <Button onClick={handleAdvancedFilterClear} variant="contained" size="large">
                    Clear All Filters
                </Button>
            </Paper>
        );
    }

    return (
        <Box>
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                sx={{
                    mb: 3, p: 2, borderRadius: 2,
                    bgcolor: 'background.paper',
                    border: `1px solid ${alpha(theme.palette.divider, 0.5)}`
                }}
                spacing={2}
            >
                <Typography variant="h6" fontWeight={600}>
                    {products.length} <Typography component="span" color="text.secondary">Products Found</Typography>
                </Typography>

                <Stack direction="row" spacing={2} alignItems="center">
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Items per page</InputLabel>
                        <Select
                            value={itemsPerPage}
                            label="Items per page"
                            onChange={handleItemsPerPageChange}
                            IconComponent={FaChevronDown}
                            sx={{ borderRadius: 2 }}
                        >
                            {[12, 24, 36, 48].map(val => (
                                <MenuItem key={val} value={val}>{val} per page</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Stack>
            </Stack>

            <Grid container spacing={3}>
                {paginatedProducts.map((p) => (
                    <Grid item xs={12} sm={6} lg={viewMode === 'list' ? 12 : 4} key={p._id}>
                        <Fade in timeout={300}>
                            <Box sx={{
                                position: 'relative',
                                borderRadius: 3, overflow: 'hidden',
                                transition: "all 0.3s ease",
                                border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                                '&:hover': { transform: "translateY(-4px)", boxShadow: 3 }
                            }}>
                                <ProductCard product={p} viewMode={viewMode} />
                                {p.countInStock === 0 && (
                                    <Chip
                                        label="Out of Stock" color="error" size="small"
                                        sx={{ position: "absolute", top: 12, right: 12, zIndex: 2 }}
                                    />
                                )}
                            </Box>
                        </Fade>
                    </Grid>
                ))}
            </Grid>

            {!enableInfiniteScroll && totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={handlePageChange}
                        color="primary"
                        sx={{ '& .MuiPaginationItem-root': { borderRadius: 2, fontWeight: 600 } }}
                    />
                </Box>
            )}

            {enableInfiniteScroll && loadingMore && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                    <CircularProgress size={32} />
                </Box>
            )}
        </Box>
    );
};

export default ProductDisplay;
