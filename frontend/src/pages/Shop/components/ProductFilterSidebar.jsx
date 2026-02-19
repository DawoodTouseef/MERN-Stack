import React, { useState } from 'react';
import {
    Box,
    Typography,
    Stack,
    Paper,
    Divider,
    Checkbox,
    FormControlLabel,
    Slider,
    Rating,
    IconButton,
    Button,
    Collapse,
    useTheme,
    alpha,
    SwipeableDrawer,
    TextField,
    Switch,
    Radio,
    RadioGroup,
    FormGroup
} from "@mui/material";
import {
    FaChevronDown,
    FaSearch,
    FaTimes,
    FaFilter
} from "react-icons/fa";
import useCurrency from '../../../hooks/useCurrency';

const FilterSection = ({ title, children, defaultOpen = true, onClear, showClear, count }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const theme = useTheme();

    return (
        <Box sx={{ mb: 3 }}>
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                onClick={() => setIsOpen(!isOpen)}
                sx={{
                    cursor: 'pointer',
                    '&:hover': { opacity: 0.8 },
                    userSelect: 'none',
                    mb: isOpen ? 1 : 0
                }}
            >
                <Typography
                    variant="subtitle1"
                    sx={{
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                    }}
                >
                    {title}
                    {count !== undefined && count > 0 && (
                        <Typography component="span" variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                            ({count})
                        </Typography>
                    )}
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1}>
                    {showClear && (
                        <Typography
                            variant="caption"
                            sx={{
                                color: 'primary.main',
                                fontWeight: 700,
                                '&:hover': { textDecoration: 'underline' }
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                onClear();
                            }}
                        >
                            CLEAR
                        </Typography>
                    )}
                    <Box
                        sx={{
                            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.3s ease',
                            display: 'flex',
                            color: 'text.secondary'
                        }}
                    >
                        <FaChevronDown size={12} />
                    </Box>
                </Stack>
            </Stack>
            <Collapse in={isOpen}>
                <Box sx={{ pt: 1 }}>
                    {children}
                </Box>
            </Collapse>
            <Divider sx={{ mt: 2, opacity: 0.6 }} />
        </Box>
    );
};

const ProductFilterSidebar = ({
    filters,
    onFilterChange,
    onClearAll,
    categories = [],
    brands = [],
    facets = {},
    isMobile,
    onClose,
    isOpen: isDrawerOpen
}) => {
    const theme = useTheme();
    const { rate, symbol } = useCurrency();
    const [brandSearch, setBrandSearch] = useState('');

    const maxPriceLimit = Math.ceil(5000 * rate);

    const handlePriceChange = (event, newValue) => {
        onFilterChange({ ...filters, priceRange: newValue });
    };

    const handleToggleFilter = (key, value) => {
        const current = Array.isArray(filters[key]) ? filters[key] : [];
        const updated = current.includes(value)
            ? current.filter(item => item !== value)
            : [...current, value];
        onFilterChange({ ...filters, [key]: updated });
    };

    const filteredBrands = brands.filter(b =>
        b.name?.toLowerCase().includes(brandSearch.toLowerCase())
    );

    const SidebarContent = (
        <Box sx={{
            p: 3,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'background.paper',
            overflowY: 'auto',
            width: isMobile ? '85vw' : 'auto',
            maxWidth: isMobile ? 320 : 'none'
        }}>
            {/* Header */}
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 4 }}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box sx={{
                        p: 1,
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                        display: 'flex'
                    }}>
                        <FaFilter size={16} />
                    </Box>
                    <Typography variant="h6" fontWeight={900}>Filters</Typography>
                </Stack>
                <Button
                    size="small"
                    onClick={onClearAll}
                    sx={{
                        textTransform: 'none',
                        fontWeight: 700,
                        minWidth: 'auto',
                        p: 0,
                        '&:hover': { background: 'none', textDecoration: 'underline' }
                    }}
                >
                    Clear All
                </Button>
            </Stack>

            {/* Delivery filter */}
            <FilterSection title="Delivery">
                <FormControlLabel
                    control={
                        <Switch
                            checked={filters.delivery === 'fast'}
                            onChange={(e) => onFilterChange({ ...filters, delivery: e.target.checked ? 'fast' : 'all' })}
                            color="primary"
                            size="small"
                        />
                    }
                    label={
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography sx={{ fontSize: '0.875rem', fontWeight: 600 }}>Get It by Tomorrow</Typography>
                            <Box sx={{ bgcolor: 'info.main', color: 'white', px: 0.8, py: 0.2, borderRadius: 1, fontSize: '0.6rem', fontWeight: 900 }}>PRIME</Box>
                        </Stack>
                    }
                    sx={{ ml: 0, mb: 1 }}
                />
            </FilterSection>

            {/* Category Section */}
            <FilterSection
                title="Category"
                onClear={() => onFilterChange({ ...filters, category: [] })}
                showClear={filters.category?.length > 0}
                count={categories.length}
            >
                <FormGroup>
                    {categories.map((cat) => {
                        const facetCount = facets?.categories?.find(c => c._id === cat._id)?.count;
                        const isChecked = filters.category?.includes(cat._id);
                        return (
                            <FormControlLabel
                                key={cat._id}
                                control={
                                    <Checkbox
                                        checked={isChecked}
                                        onChange={() => handleToggleFilter('category', cat._id)}
                                        size="small"
                                    />
                                }
                                label={
                                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ width: '100%', gap: 1 }}>
                                        <Typography sx={{ fontSize: '0.875rem', fontWeight: isChecked ? 700 : 500, color: isChecked ? 'primary.main' : 'text.primary' }}>
                                            {cat.name}
                                        </Typography>
                                        {facetCount !== undefined && <Typography variant="caption" color="text.secondary">{facetCount}</Typography>}
                                    </Stack>
                                }
                                sx={{ mb: 0, '& .MuiFormControlLabel-label': { width: '100%' } }}
                            />
                        );
                    })}
                </FormGroup>
            </FilterSection>

            {/* Price Range Section */}
            <FilterSection
                title="Price Range"
                onClear={() => onFilterChange({ ...filters, priceRange: 'all' })}
                showClear={filters.priceRange !== 'all'}
            >
                <Box sx={{ px: 1.5, mt: 1 }}>
                    <Slider
                        value={Array.isArray(filters.priceRange) ? filters.priceRange : [0, maxPriceLimit]}
                        onChange={handlePriceChange}
                        valueLabelDisplay="auto"
                        min={0}
                        max={maxPriceLimit}
                        size="small"
                    />
                    <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                            {symbol}{Array.isArray(filters.priceRange) ? filters.priceRange[0] : 0}
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                            {symbol}{Array.isArray(filters.priceRange) ? filters.priceRange[1] : maxPriceLimit}
                        </Typography>
                    </Stack>
                </Box>
            </FilterSection>

            {/* Customer Ratings */}
            <FilterSection
                title="Avg. Customer Review"
                onClear={() => onFilterChange({ ...filters, rating: 0 })}
                showClear={filters.rating > 0}
            >
                <Stack spacing={0.5}>
                    {[4, 3, 2, 1].map((rate) => {
                        const facetCount = facets?.ratings?.find(r => r._id === rate)?.count;
                        const isSelected = filters.rating === rate;
                        return (
                            <Box
                                key={rate}
                                onClick={() => onFilterChange({ ...filters, rating: rate })}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    cursor: 'pointer',
                                    p: 0.8,
                                    borderRadius: 1.5,
                                    bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) }
                                }}
                            >
                                <Rating value={rate} readOnly size="small" />
                                <Typography sx={{ fontSize: '0.85rem', fontWeight: isSelected ? 700 : 500, color: isSelected ? 'primary.main' : 'text.primary' }}>
                                    & Up
                                </Typography>
                                {facetCount !== undefined && (
                                    <Typography variant="caption" sx={{ ml: 'auto', color: 'text.secondary' }}>
                                        {facetCount}
                                    </Typography>
                                )}
                            </Box>
                        );
                    })}
                </Stack>
            </FilterSection>

            {/* Brands Section */}
            <FilterSection
                title="Brands"
                onClear={() => onFilterChange({ ...filters, brand: [] })}
                showClear={filters.brand?.length > 0}
                count={brands.length}
            >
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Search brands..."
                    value={brandSearch}
                    onChange={(e) => setBrandSearch(e.target.value)}
                    sx={{ mb: 1, '& .MuiOutlinedInput-root': { borderRadius: 2, height: 36, fontSize: '0.85rem' } }}
                />
                <Box sx={{ maxHeight: 200, overflowY: 'auto', pr: 1 }}>
                    <FormGroup>
                        {filteredBrands.map((brand) => {
                            const facetCount = facets?.brands?.find(b => b._id === brand._id)?.count;
                            const isChecked = filters.brand?.includes(brand._id);
                            return (
                                <FormControlLabel
                                    key={brand._id}
                                    control={
                                        <Checkbox
                                            checked={isChecked}
                                            onChange={() => handleToggleFilter('brand', brand._id)}
                                            size="small"
                                        />
                                    }
                                    label={
                                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ width: '100%', gap: 1 }}>
                                            <Typography sx={{ fontSize: '0.875rem', fontWeight: isChecked ? 700 : 500 }}>
                                                {brand.name}
                                            </Typography>
                                            {facetCount !== undefined && <Typography variant="caption" color="text.secondary">{facetCount}</Typography>}
                                        </Stack>
                                    }
                                    sx={{ mb: 0, '& .MuiFormControlLabel-label': { width: '100%' } }}
                                />
                            );
                        })}
                    </FormGroup>
                </Box>
            </FilterSection>

            {/* Seller Type */}
            <FilterSection title="Seller">
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={filters.seller === 'top_rated'}
                            onChange={(e) => onFilterChange({ ...filters, seller: e.target.checked ? 'top_rated' : 'all' })}
                            size="small"
                        />
                    }
                    label={<Typography sx={{ fontSize: '0.875rem', fontWeight: filters.seller === 'top_rated' ? 700 : 500 }}>Top Rated Sellers</Typography>}
                    sx={{ mb: 0 }}
                />
            </FilterSection>

            {/* Discount filter */}
            <FilterSection
                title="Deals & Discounts"
                onClear={() => onFilterChange({ ...filters, discount: 'all' })}
                showClear={filters.discount !== 'all'}
            >
                <RadioGroup
                    value={String(filters.discount)}
                    onChange={(e) => onFilterChange({ ...filters, discount: e.target.value })}
                >
                    {[10, 25, 50, 70].map((d) => (
                        <FormControlLabel
                            key={d}
                            value={String(d)}
                            control={<Radio size="small" />}
                            label={<Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>{d}% Off or More</Typography>}
                            sx={{ mb: -0.5 }}
                        />
                    ))}
                    <FormControlLabel
                        value="all"
                        control={<Radio size="small" />}
                        label={<Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>All Products</Typography>}
                    />
                </RadioGroup>
            </FilterSection>

            {/* Availability */}
            <FilterSection title="Availability">
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={filters.availability === 'in_stock'}
                            onChange={(e) => onFilterChange({ ...filters, availability: e.target.checked ? 'in_stock' : 'all' })}
                            size="small"
                        />
                    }
                    label={<Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>Exclude Out of Stock</Typography>}
                />
            </FilterSection>

            {/* Mobile Footer */}
            {isMobile && (
                <Box sx={{ mt: 'auto', pt: 3, position: 'sticky', bottom: 0, bgcolor: 'background.paper' }}>
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={onClose}
                        sx={{
                            py: 1.5,
                            borderRadius: 3,
                            fontWeight: 800,
                        }}
                    >
                        Show Results
                    </Button>
                </Box>
            )}
        </Box>
    );

    if (isMobile) {
        return (
            <SwipeableDrawer
                anchor="left"
                open={isDrawerOpen}
                onClose={onClose}
                onOpen={() => { }}
                PaperProps={{
                    sx: { borderTopRightRadius: 20, borderBottomRightRadius: 20 }
                }}
            >
                {SidebarContent}
            </SwipeableDrawer>
        );
    }

    return (
        <Paper
            elevation={0}
            sx={{
                width: '100%',
                borderRadius: 4,
                border: '1px solid',
                borderColor: 'divider',
                overflow: 'hidden',
                position: 'sticky',
                top: 24,
                bgcolor: 'background.paper',
            }}
        >
            {SidebarContent}
        </Paper>
    );
};

export default ProductFilterSidebar;
