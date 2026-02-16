import React from 'react';
import {
    Box,
    Typography,
    Button,
    Drawer,
    Stack,
    IconButton,
    alpha,
    useTheme
} from "@mui/material";
import { FaTimes } from "react-icons/fa";
import AdvancedFilterPanel from "../../../components/AdvancedFilterPanel";

const ShopSidebar = ({
    advancedFilters,
    handleAdvancedFilterChange,
    handleAdvancedFilterClear,
    activeFiltersCount,
    showFilters,
    setShowFilters,
    isMobile
}) => {
    // Task List:
    // - [x] Refactor Shop Page ✅
    // - [x] Extract `useShopFilters` hook
    // - [x] Create `ShopHeader` component
    // - [x] Create `ShopSidebar` component
    // - [x] Create `ProductDisplay` component
    // - [x] Integrate components in `Shop.jsx`
    const theme = useTheme();

    const filterContent = (
        <Box sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <Box sx={{
                mb: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <Typography variant="h6" fontWeight="700" sx={{ fontSize: '1.25rem' }}>Filters</Typography>
                {activeFiltersCount > 0 && (
                    <Button
                        size="small"
                        onClick={handleAdvancedFilterClear}
                        sx={{
                            textTransform: 'none',
                            color: theme.palette.error.main,
                            fontWeight: 600,
                            fontSize: '0.875rem'
                        }}
                    >
                        Clear All
                    </Button>
                )}
            </Box>
            <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: 1 }}>
                <AdvancedFilterPanel
                    filters={advancedFilters}
                    onFiltersChange={handleAdvancedFilterChange}
                    onClearFilters={handleAdvancedFilterClear}
                />
            </Box>
        </Box>
    );

    if (isMobile) {
        return (
            <Drawer
                anchor="left"
                open={showFilters}
                onClose={() => setShowFilters(false)}
                PaperProps={{
                    sx: {
                        width: '80%',
                        maxWidth: 300,
                        p: 3,
                        borderTopRightRadius: 16,
                        borderBottomRightRadius: 16,
                        bgcolor: theme.palette.background.paper,
                    }
                }}
            >
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Typography variant="h6" fontWeight="700">Filters</Typography>
                    <IconButton onClick={() => setShowFilters(false)}>
                        <FaTimes />
                    </IconButton>
                </Stack>
                {filterContent}
            </Drawer>
        );
    }

    return (
        <Box sx={{
            position: 'sticky',
            top: 24,
            maxHeight: 'calc(100vh - 48px)',
            display: 'flex',
            flexDirection: 'column',
            pr: 1.5,
            '&::-webkit-scrollbar': { width: 6 },
            '&::-webkit-scrollbar-thumb': {
                backgroundColor: alpha(theme.palette.primary.main, 0.2),
                borderRadius: 3
            }
        }}>
            {filterContent}
        </Box>
    );
};

export default ShopSidebar;
