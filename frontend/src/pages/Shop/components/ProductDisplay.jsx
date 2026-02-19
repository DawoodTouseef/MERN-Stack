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
    Select,
    MenuItem,
    CircularProgress,
    Chip
} from "@mui/material";
import { SearchOffRounded } from "@mui/icons-material";
import { motion } from "framer-motion";
import ProductCard from "../../Products/ProductCard";

const ProductDisplay = ({
    products,
    isLoading,
    totalCount,
    currentPage,
    onPageChange,
    itemsPerPage,
    onItemsPerPageChange,
    viewMode,
    isMobile,
    searchQuery,
    handleAdvancedFilterClear,
    enableInfiniteScroll,
    loadingMore
}) => {
    const theme = useTheme();

    const totalPages = Math.ceil(totalCount / itemsPerPage);

    // Calculate display products (if backend pagination isn't used for slicing)
    // Actually facetedSearchQuery handles limit, so products should be what we want to show
    // But if we have local shop filters on top, we might need slicing. 
    // Usually with totalCount we expect the backend to have done the pagination.
    const displayProducts = products;

    // Loading skeletons
    if (isLoading && products.length === 0) {
        return (
            <Grid container spacing={3}>
                {[...Array(itemsPerPage)].map((_, index) => (
                    <Grid item xs={12} sm={6} lg={viewMode === 'list' ? 12 : 4} key={index}>
                        <Box sx={{ borderRadius: 4, overflow: 'hidden' }}>
                            <Skeleton
                                variant="rectangular"
                                height={viewMode === 'list' ? 180 : 320}
                                sx={{
                                    borderRadius: 4,
                                    bgcolor: alpha(theme.palette.primary.main, 0.06),
                                    animation: 'wave',
                                }}
                            />
                            <Box sx={{ p: 1.5 }}>
                                <Skeleton variant="text" height={22} sx={{ borderRadius: 1 }} />
                                <Skeleton variant="text" height={18} width="60%" sx={{ borderRadius: 1 }} />
                                <Skeleton variant="text" height={26} width="40%" sx={{ borderRadius: 1, mt: 0.5 }} />
                            </Box>
                        </Box>
                    </Grid>
                ))}
            </Grid>
        );
    }

    // Empty state
    if (products.length === 0 && !isLoading) {
        return (
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 6, md: 10 },
                    textAlign: 'center',
                    borderRadius: 5,
                    bgcolor: alpha(theme.palette.primary.main, 0.02),
                    border: `1px dashed ${alpha(theme.palette.primary.main, 0.2)}`
                }}
            >
                <Box sx={{
                    width: 100, height: 100, borderRadius: '50%',
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    mx: 'auto', mb: 3,
                    border: `2px solid ${alpha(theme.palette.primary.main, 0.15)}`
                }}>
                    <SearchOffRounded sx={{ color: theme.palette.primary.main, fontSize: '2.5rem' }} />
                </Box>
                <Typography variant="h5" fontWeight={800} sx={{ mb: 1, letterSpacing: '-0.02em' }}>
                    No products found
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 360, mx: 'auto' }}>
                    We couldn't find anything matching your filters. Try broadening your search or clearing filters.
                </Typography>
                <Button
                    onClick={handleAdvancedFilterClear}
                    variant="contained"
                    size="large"
                    sx={{
                        borderRadius: 3,
                        px: 5,
                        py: 1.5,
                        fontWeight: 700,
                        textTransform: 'none',
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                        '&:hover': { boxShadow: `0 12px 28px ${alpha(theme.palette.primary.main, 0.4)}` }
                    }}
                >
                    Clear All Filters
                </Button>
            </Paper>
        );
    }

    return (
        <Box>
            {/* Results Bar */}
            <Paper
                elevation={0}
                sx={{
                    mb: 3,
                    p: 2,
                    borderRadius: 3,
                    border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
                    bgcolor: theme.palette.background.paper,
                    borderLeft: `4px solid ${theme.palette.primary.main}`,
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    justifyContent: 'space-between',
                    gap: 2
                }}
            >
                <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                        {totalCount > 0 ? (
                            <>
                                Showing <Box component="span" sx={{ color: 'text.primary', fontWeight: 700 }}>
                                    {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalCount)}
                                </Box> of <Box component="span" sx={{ color: 'text.primary', fontWeight: 700 }}>{totalCount}</Box> results
                                {searchQuery && (
                                    <> for <Box component="span" sx={{ color: 'primary.main', fontWeight: 700 }}>"{searchQuery}"</Box></>
                                )}
                            </>
                        ) : (
                            'Searching...'
                        )}
                    </Typography>
                </Stack>

                <Stack direction="row" alignItems="center" spacing={3}>
                    {/* Items Per Page */}
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}>Show:</Typography>
                        <Select
                            value={itemsPerPage}
                            onChange={(e) => onItemsPerPageChange(e.target.value)}
                            size="small"
                            variant="standard"
                            disableUnderline
                            sx={{
                                fontSize: '0.85rem',
                                fontWeight: 800,
                                '& .MuiSelect-select': { py: 0.5, pr: 2 }
                            }}
                        >
                            {[12, 24, 48, 96].map(num => (
                                <MenuItem key={num} value={num}>{num}</MenuItem>
                            ))}
                        </Select>
                    </Stack>
                </Stack>
            </Paper>

            {/* Product Grid/List Container */}
            <Grid container spacing={3}>
                {displayProducts.map((p, index) => (
                    <Grid item xs={12} sm={6} lg={viewMode === 'list' ? 12 : 4} key={p._id}>
                        <Fade in timeout={200 + index * 30}>
                            <Box
                                component={motion.div}
                                whileHover={{ y: -8 }}
                                transition={{ duration: 0.25, ease: 'easeOut' }}
                                sx={{
                                    position: 'relative',
                                    borderRadius: 4,
                                    overflow: 'hidden',
                                    border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                                    boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.04)}`,
                                    '&:hover': {
                                        boxShadow: `0 16px 40px ${alpha(theme.palette.primary.main, 0.12)}`,
                                        borderColor: alpha(theme.palette.primary.main, 0.3)
                                    },
                                    transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
                                    bgcolor: theme.palette.background.paper
                                }}
                            >
                                <ProductCard product={p} viewMode={viewMode} />
                                {p.countInStock === 0 && (
                                    <Chip
                                        label="Out of Stock"
                                        color="error"
                                        size="small"
                                        sx={{
                                            position: "absolute", top: 12, right: 12, zIndex: 2,
                                            fontWeight: 700, borderRadius: 1.5
                                        }}
                                    />
                                )}
                            </Box>
                        </Fade>
                    </Grid>
                ))}
            </Grid>

            {/* Pagination */}
            {!enableInfiniteScroll && totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                    <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={(e, v) => onPageChange(v)}
                        color="primary"
                        size="large"
                        sx={{
                            '& .MuiPaginationItem-root': {
                                borderRadius: 2,
                                fontWeight: 700,
                                '&.Mui-selected': {
                                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                    color: 'white',
                                    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
                                }
                            }
                        }}
                    />
                </Box>
            )}

            {/* Infinite Scroll Loader */}
            {enableInfiniteScroll && loadingMore && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress size={36} thickness={4} />
                </Box>
            )}
        </Box>
    );
};

export default ProductDisplay;
