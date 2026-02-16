import React from 'react';
import {
    Box,
    Typography,
    Stack,
    Paper,
    Badge,
    Tooltip,
    IconButton,
    Zoom,
    alpha,
    useTheme,
    Button
} from "@mui/material";
import {
    FaTags,
    FaThLarge,
    FaBars,
    FaFilter,
    FaSearch
} from "react-icons/fa";
import SmartSearchSuggestions from "../../../components/SmartSearchSuggestions";

const ShopHeader = ({
    searchQuery,
    handleSearch,
    filteredProductsCount,
    viewMode,
    handleViewModeChange,
    activeFiltersCount,
    handleFilterToggle,
    isMobile
}) => {
    const theme = useTheme();
    const [isSearchFocused, setIsSearchFocused] = React.useState(false);
    const [showSuggestions, setShowSuggestions] = React.useState(false);

    return (
        <Paper
            elevation={0}
            sx={{
                p: { xs: 2, sm: 3, md: 4 },
                mb: 4,
                borderRadius: 3,
                background: "#fff",
                position: 'relative',
                overflow: 'hidden',
                border: `1px solid ${alpha('#6366f1', 0.1)}`,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
            }}
        >
            <Stack
                direction={{ xs: "column", md: "row" }}
                alignItems={{ xs: "flex-start", md: "center" }}
                justifyContent="space-between"
                spacing={{ xs: 2, md: 3 }}
                sx={{ mb: 3 }}
            >
                <Stack direction="row" alignItems="center" spacing={2}>
                    <Box
                        sx={{
                            width: { xs: 40, sm: 48 },
                            height: { xs: 40, sm: 48 },
                            borderRadius: '12px',
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: `0 4px 8px ${alpha(theme.palette.primary.main, 0.1)}`
                        }}
                    >
                        <FaTags style={{
                            color: '#6366f1',
                            fontSize: '1.25rem'
                        }} />
                    </Box>
                    <Box>
                        <Typography
                            variant="h1"
                            component="h1"
                            sx={{
                                color: '#1e293b',
                                fontWeight: 800,
                                fontSize: { xs: "1.75rem", sm: "2.25rem", md: "2.5rem" },
                                lineHeight: 1.2,
                                letterSpacing: '-0.5px'
                            }}
                        >
                            Shop Products
                        </Typography>
                        <Typography
                            variant="subtitle1"
                            sx={{
                                color: theme.palette.text.secondary,
                                mt: 0.5,
                                fontSize: { xs: "0.875rem", sm: "1rem" }
                            }}
                        >
                            Discover amazing products at great prices
                        </Typography>
                    </Box>
                    <Zoom in>
                        <Badge
                            badgeContent={filteredProductsCount}
                            color="primary"
                            max={999}
                            sx={{
                                "& .MuiBadge-badge": {
                                    fontWeight: 700,
                                    fontSize: "0.75rem",
                                    p: '0 6px',
                                    minWidth: 20,
                                    height: 20,
                                    borderRadius: 10,
                                    top: 10,
                                    right: 10
                                },
                            }}
                        />
                    </Zoom>
                </Stack>

                <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{
                        mt: { xs: 1, md: 0 },
                        width: { xs: '100%', md: 'auto' },
                        justifyContent: { xs: 'space-between', md: 'flex-end' }
                    }}
                >
                    <Tooltip title="Grid View" arrow>
                        <IconButton
                            onClick={() => handleViewModeChange('grid')}
                            color={viewMode === 'grid' ? 'primary' : 'default'}
                            sx={{
                                borderRadius: 2,
                                p: 1.25,
                                backgroundColor: viewMode === 'grid' ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                                '&:hover': {
                                    backgroundColor: alpha(theme.palette.primary.main, 0.2)
                                },
                                border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <FaThLarge />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="List View" arrow>
                        <IconButton
                            onClick={() => handleViewModeChange('list')}
                            color={viewMode === 'list' ? 'primary' : 'default'}
                            sx={{
                                borderRadius: 2,
                                p: 1.25,
                                backgroundColor: viewMode === 'list' ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                                '&:hover': {
                                    backgroundColor: alpha(theme.palette.primary.main, 0.2)
                                },
                                border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <FaBars />
                        </IconButton>
                    </Tooltip>

                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<FaFilter />}
                        endIcon={activeFiltersCount > 0 ? <Badge badgeContent={activeFiltersCount} color="error" /> : null}
                        onClick={handleFilterToggle}
                        sx={{
                            display: { xs: "flex", md: "none" },
                            borderRadius: 2,
                            fontWeight: 600,
                            px: { xs: 2, sm: 3 },
                            py: 1.25,
                            textTransform: "none",
                            boxShadow: 2,
                            position: 'relative',
                            height: 44,
                            minWidth: 120
                        }}
                    >
                        Filters
                    </Button>
                </Stack>
            </Stack>

            <Box sx={{ position: 'relative', mb: 3 }}>
                <SmartSearchSuggestions
                    onSearch={handleSearch}
                    placeholder="Search products, brands, categories..."
                    size="large"
                    onFocus={() => {
                        setIsSearchFocused(true);
                        setShowSuggestions(true);
                    }}
                    onBlur={() => {
                        setIsSearchFocused(false);
                        setTimeout(() => setShowSuggestions(false), 200);
                    }}
                    isVisible={showSuggestions && searchQuery.length > 0}
                    sx={{
                        '& .MuiInputBase-root': {
                            borderRadius: 2,
                            backgroundColor: theme.palette.background.paper,
                            transition: 'all 0.3s ease',
                            transform: isSearchFocused ? 'scale(1.01)' : 'scale(1)',
                            boxShadow: isSearchFocused ? 3 : 1,
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                            '&:hover': { boxShadow: 2 }
                        }
                    }}
                />
                <Box sx={{
                    position: 'absolute',
                    right: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: theme.palette.text.secondary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    bgcolor: alpha(theme.palette.primary.main, 0.1)
                }}>
                    <FaSearch style={{
                        color: theme.palette.primary.main,
                        fontSize: '1rem'
                    }} />
                </Box>
            </Box>
        </Paper>
    );
};

export default ShopHeader;
