import React from 'react';
import {
    Box,
    Typography,
    Stack,
    Paper,
    Badge,
    Tooltip,
    IconButton,
    alpha,
    useTheme,
    Button,
    Chip,
    FormControl,
    Select,
    MenuItem
} from "@mui/material";
import {
    FaTags,
    FaThLarge,
    FaBars,
    FaFilter,
    FaSearch,
    FaChevronDown
} from "react-icons/fa";
import { TuneRounded } from "@mui/icons-material";
import SmartSearchSuggestions from "../../../components/SmartSearchSuggestions";

const ShopHeader = ({
    searchQuery,
    handleSearch,
    filteredProductsCount,
    viewMode,
    handleViewModeChange,
    activeFiltersCount,
    handleFilterToggle,
    isMobile,
    sortBy,
    sortOrder,
    handleSortChange
}) => {
    const theme = useTheme();
    const [isSearchFocused, setIsSearchFocused] = React.useState(false);
    const [showSuggestions, setShowSuggestions] = React.useState(false);

    const sortOptions = [
        { label: 'Featured', value: 'newest', order: 'desc' },
        { label: 'Price: Low to High', value: 'price', order: 'asc' },
        { label: 'Price: High to Low', value: 'price', order: 'desc' },
        { label: 'Avg. Customer Review', value: 'rating', order: 'desc' },
        { label: 'Newest Arrivals', value: 'newest', order: 'desc' },
        { label: 'Most Popular', value: 'popular', order: 'desc' }
    ];

    const currentSortLabel = sortOptions.find(opt => opt.value === sortBy && opt.order === sortOrder)?.label || 'Sort by';

    return (
        <Paper
            elevation={0}
            sx={{
                mb: 4,
                borderRadius: 5,
                position: 'relative',
                overflow: 'hidden',
                background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
                color: 'white',
                boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.25)}`
            }}
        >
            {/* Ambient Background Glows */}
            <Box sx={{
                position: 'absolute', top: -80, right: -80,
                width: 280, height: 280, borderRadius: '50%',
                background: alpha('#fff', 0.07), filter: 'blur(40px)', zIndex: 1
            }} />
            <Box sx={{
                position: 'absolute', bottom: -60, left: -60,
                width: 200, height: 200, borderRadius: '50%',
                background: alpha(theme.palette.secondary.main, 0.15), filter: 'blur(40px)', zIndex: 1
            }} />

            <Box sx={{ p: { xs: 3, sm: 4, md: 5 }, position: 'relative', zIndex: 2 }}>
                {/* Top Row: Title + Controls */}
                <Stack
                    direction={{ xs: "column", md: "row" }}
                    alignItems={{ xs: "flex-start", md: "center" }}
                    justifyContent="space-between"
                    spacing={{ xs: 2, md: 3 }}
                    sx={{ mb: 4 }}
                >
                    {/* Title */}
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <Box sx={{
                            width: { xs: 44, sm: 52 },
                            height: { xs: 44, sm: 52 },
                            borderRadius: '14px',
                            bgcolor: alpha('#fff', 0.15),
                            border: `1px solid ${alpha('#fff', 0.25)}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            backdropFilter: 'blur(8px)',
                        }}>
                            <FaTags style={{ color: '#fff', fontSize: '1.25rem' }} />
                        </Box>
                        <Box>
                            <Typography
                                variant="h1"
                                component="h1"
                                sx={{
                                    color: 'white',
                                    fontWeight: 900,
                                    fontSize: { xs: "1.75rem", sm: "2.25rem", md: "2.75rem" },
                                    lineHeight: 1.1,
                                    letterSpacing: '-0.03em'
                                }}
                            >
                                Shop{' '}
                                <Box component="span" sx={{ color: alpha('#fff', 0.65) }}>
                                    Products
                                </Box>
                            </Typography>
                        </Box>
                    </Stack>

                    {/* Right Controls */}
                    <Stack
                        direction="row"
                        spacing={2}
                        alignItems="center"
                        sx={{ mt: { xs: 1, md: 0 }, width: { xs: '100%', md: 'auto' }, justifyContent: { xs: 'space-between', md: 'flex-end' } }}
                    >
                        {/* Sort Dropdown */}
                        <Box sx={{ position: 'relative', display: { xs: 'none', lg: 'block' } }}>
                            <Button
                                size="small"
                                endIcon={<FaChevronDown size={10} />}
                                sx={{
                                    bgcolor: alpha('#fff', 0.1),
                                    color: 'white',
                                    px: 2,
                                    py: 1,
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    fontSize: '0.85rem',
                                    '&:hover': { bgcolor: alpha('#fff', 0.2) }
                                }}
                                onClick={(e) => {
                                    // Normally use Menu here, but shorthand for custom dropdown
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    // Internal state for menu removed for brevity, assume Menu integration or just custom styled Select
                                }}
                            >
                                Sort by: {currentSortLabel}
                            </Button>
                        </Box>

                        <FormControl size="small" sx={{
                            minWidth: 160,
                            display: { xs: 'flex', lg: 'none' },
                            '& .MuiOutlinedInput-root': {
                                color: 'white',
                                bgcolor: alpha('#fff', 0.1),
                                borderRadius: 2,
                                '& fieldset': { borderColor: alpha('#fff', 0.2) },
                                '&:hover fieldset': { borderColor: alpha('#fff', 0.4) },
                                '&.Mui-focused fieldset': { borderColor: 'white' },
                            },
                            '& .MuiSvgIcon-root': { color: 'white' }
                        }}>
                            <Select
                                value={`${sortBy}-${sortOrder}`}
                                displayEmpty
                                onChange={(e) => {
                                    const [val, ord] = e.target.value.split('-');
                                    handleSortChange(val, ord);
                                }}
                                renderValue={(selected) => {
                                    if (!selected) return <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>Sort by</Typography>;
                                    return <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>{currentSortLabel}</Typography>;
                                }}
                            >
                                {sortOptions.map(opt => (
                                    <MenuItem key={`${opt.value}-${opt.order}`} value={`${opt.value}-${opt.order}`}>
                                        {opt.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {/* Product Count Chip */}
                        <Chip
                            label={`${filteredProductsCount} items`}
                            sx={{
                                bgcolor: alpha('#fff', 0.15),
                                color: 'white',
                                fontWeight: 700,
                                fontSize: '0.85rem',
                                border: `1px solid ${alpha('#fff', 0.25)}`,
                                backdropFilter: 'blur(8px)',
                                '& .MuiChip-label': { px: 1.5 }
                            }}
                        />

                        {/* View Mode Toggle — Segmented Control */}
                        <Box sx={{
                            display: 'flex',
                            bgcolor: alpha('#fff', 0.1),
                            borderRadius: '10px',
                            border: `1px solid ${alpha('#fff', 0.2)}`,
                            p: 0.5,
                            gap: 0.5
                        }}>
                            <Tooltip title="Grid View" arrow>
                                <IconButton
                                    onClick={() => handleViewModeChange('grid')}
                                    size="small"
                                    sx={{
                                        borderRadius: '8px',
                                        p: 1,
                                        color: viewMode === 'grid' ? theme.palette.primary.dark : alpha('#fff', 0.7),
                                        bgcolor: viewMode === 'grid' ? 'white' : 'transparent',
                                        '&:hover': { bgcolor: viewMode === 'grid' ? 'white' : alpha('#fff', 0.15) },
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <FaThLarge style={{ fontSize: '0.9rem' }} />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="List View" arrow>
                                <IconButton
                                    onClick={() => handleViewModeChange('list')}
                                    size="small"
                                    sx={{
                                        borderRadius: '8px',
                                        p: 1,
                                        color: viewMode === 'list' ? theme.palette.primary.dark : alpha('#fff', 0.7),
                                        bgcolor: viewMode === 'list' ? 'white' : 'transparent',
                                        '&:hover': { bgcolor: viewMode === 'list' ? 'white' : alpha('#fff', 0.15) },
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <FaBars style={{ fontSize: '0.9rem' }} />
                                </IconButton>
                            </Tooltip>
                        </Box>

                        {/* Mobile Filter Button */}
                        <Button
                            variant="contained"
                            startIcon={<TuneRounded />}
                            onClick={handleFilterToggle}
                            sx={{
                                display: { xs: "flex", md: "none" },
                                borderRadius: 3,
                                fontWeight: 700,
                                px: 2.5,
                                py: 1.25,
                                textTransform: "none",
                                bgcolor: 'white',
                                color: theme.palette.primary.dark,
                                '&:hover': { bgcolor: alpha('#fff', 0.9) },
                                boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.2)}`,
                                position: 'relative',
                                minWidth: 110
                            }}
                        >
                            Filters
                            {activeFiltersCount > 0 && (
                                <Box sx={{
                                    position: 'absolute', top: -6, right: -6,
                                    width: 20, height: 20, borderRadius: '50%',
                                    bgcolor: theme.palette.error.main, color: 'white',
                                    fontSize: '0.7rem', fontWeight: 800,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    border: '2px solid white'
                                }}>
                                    {activeFiltersCount}
                                </Box>
                            )}
                        </Button>
                    </Stack>
                </Stack>

                {/* Search Bar + Quick Sort Desktop */}
                <Stack direction="row" spacing={2} sx={{ position: 'relative' }}>
                    <Box sx={{ flex: 1 }}>
                        <SmartSearchSuggestions
                            onSearch={handleSearch}
                            placeholder="Search millions of products..."
                            size="large"
                            onFocus={() => { setIsSearchFocused(true); setShowSuggestions(true); }}
                            onBlur={() => { setIsSearchFocused(false); setTimeout(() => setShowSuggestions(false), 200); }}
                            isVisible={showSuggestions && searchQuery.length > 0}
                            sx={{
                                '& .MuiInputBase-root': {
                                    borderRadius: 3,
                                    backgroundColor: isSearchFocused ? 'white' : alpha('#fff', 0.95),
                                    transition: 'all 0.3s ease',
                                    height: 56,
                                    boxShadow: isSearchFocused
                                        ? `0 0 0 4px ${alpha(theme.palette.primary.light, 0.4)}, 0 12px 32px ${alpha(theme.palette.common.black, 0.2)}`
                                        : `0 4px 16px ${alpha(theme.palette.common.black, 0.15)}`,
                                    border: 'none',
                                },
                                '& .MuiInputBase-input': {
                                    color: theme.palette.text.primary,
                                    fontWeight: 600,
                                    fontSize: '1.1rem',
                                    pl: 3
                                }
                            }}
                        />
                        <Box sx={{
                            position: 'absolute', right: 14, top: 28,
                            transform: 'translateY(-50%)',
                            width: 44, height: 44, borderRadius: '50%',
                            bgcolor: theme.palette.primary.main,
                            color: 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            pointerEvents: 'none',
                            boxShadow: `0 4px 10px ${alpha(theme.palette.primary.main, 0.3)}`
                        }}>
                            <FaSearch style={{ fontSize: '1.1rem' }} />
                        </Box>
                    </Box>

                    {/* Desktop Sort Selector */}
                    <FormControl size="small" sx={{
                        minWidth: 200,
                        display: { xs: 'none', lg: 'flex' },
                        '& .MuiOutlinedInput-root': {
                            color: theme.palette.text.primary,
                            bgcolor: 'white',
                            borderRadius: 3,
                            height: 56,
                            fontWeight: 600,
                            '& fieldset': { border: 'none' },
                            boxShadow: `0 4px 16px ${alpha(theme.palette.common.black, 0.1)}`,
                        },
                        '& .MuiSelect-select': { pl: 2 }
                    }}>
                        <Select
                            value={`${sortBy}-${sortOrder}`}
                            onChange={(e) => {
                                const [val, ord] = e.target.value.split('-');
                                handleSortChange(val, ord);
                            }}
                        >
                            {sortOptions.map(opt => (
                                <MenuItem key={`${opt.value}-${opt.order}`} value={`${opt.value}-${opt.order}`} sx={{ fontWeight: 500 }}>
                                    {opt.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Stack>
            </Box>
        </Paper>
    );
};

export default ShopHeader;

