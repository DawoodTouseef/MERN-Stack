import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Chip,
  Skeleton,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  FlashOn,
  TrendingUp,
  LocalOffer,
  Schedule,
} from '@mui/icons-material';
import { useCalculateDynamicPriceMutation } from '../redux/api/dynamicPricingApiSlice';
import { useSelector } from 'react-redux';

const DynamicPriceDisplay = ({ 
  product, 
  quantity = 1, 
  userLocation = null,
  showOriginalPrice = true,
  showDiscountBadge = true,
  compact = false 
}) => {
  const { userInfo } = useSelector((state) => state.auth);
  const [priceData, setPriceData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [calculatePrice] = useCalculateDynamicPriceMutation();

  useEffect(() => {
    const fetchDynamicPrice = async () => {
      if (!product?._id) return;
      
      setIsLoading(true);
      try {
        const result = await calculatePrice({
          productId: product._id,
          quantity,
          userSegment: userInfo?.role || 'all',
          location: userLocation
        }).unwrap();
        
        setPriceData(result.data);
      } catch (error) {
        // Fallback to original price if dynamic pricing fails
        setPriceData({
          originalPrice: product.price,
          dynamicPrice: product.price,
          totalDiscount: 0,
          savings: 0,
          appliedPricing: null
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDynamicPrice();
  }, [product?._id, quantity, userInfo?.role, userLocation, calculatePrice]);

  const getPricingTypeIcon = (type) => {
    switch (type) {
      case 'flash_sale':
        return <FlashOn sx={{ fontSize: 14 }} />;
      case 'surge_pricing':
        return <TrendingUp sx={{ fontSize: 14 }} />;
      case 'time_based':
        return <Schedule sx={{ fontSize: 14 }} />;
      default:
        return <LocalOffer sx={{ fontSize: 14 }} />;
    }
  };

  const getPricingTypeColor = (type) => {
    switch (type) {
      case 'flash_sale':
        return 'error';
      case 'surge_pricing':
        return 'warning';
      case 'clearance':
        return 'success';
      case 'bundle_offer':
        return 'info';
      default:
        return 'primary';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  const calculateSavingsPercentage = () => {
    if (!priceData || priceData.originalPrice <= priceData.dynamicPrice) return 0;
    return Math.round(((priceData.originalPrice - priceData.dynamicPrice) / priceData.originalPrice) * 100);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CircularProgress size={16} />
        <Skeleton variant="text" width={80} />
      </Box>
    );
  }

  if (!priceData) {
    return (
      <Typography variant="h6" fontWeight="bold">
        {formatCurrency(product?.price || 0)}
      </Typography>
    );
  }

  const hasDiscount = priceData.totalDiscount > 0;
  const savingsPercentage = calculateSavingsPercentage();

  if (compact) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography 
          variant="h6" 
          fontWeight="bold"
          color={hasDiscount ? "error.main" : "text.primary"}
        >
          {formatCurrency(priceData.dynamicPrice)}
        </Typography>
        
        {hasDiscount && showOriginalPrice && (
          <Typography 
            variant="body2" 
            sx={{ 
              textDecoration: 'line-through',
              color: 'text.secondary'
            }}
          >
            {formatCurrency(priceData.originalPrice)}
          </Typography>
        )}
        
        {hasDiscount && showDiscountBadge && (
          <Chip
            size="small"
            label={`-${savingsPercentage}%`}
            color="error"
            sx={{ height: 20, fontSize: '0.75rem' }}
          />
        )}
      </Box>
    );
  }

  return (
    <Box>
      {/* Main Price Display */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Typography 
          variant="h6" 
          fontWeight="bold"
          color={hasDiscount ? "error.main" : "text.primary"}
        >
          {formatCurrency(priceData.dynamicPrice)}
        </Typography>
        
        {hasDiscount && showOriginalPrice && (
          <Typography 
            variant="body1" 
            sx={{ 
              textDecoration: 'line-through',
              color: 'text.secondary'
            }}
          >
            {formatCurrency(priceData.originalPrice)}
          </Typography>
        )}
      </Box>

      {/* Discount Information */}
      {hasDiscount && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          {showDiscountBadge && (
            <Chip
              icon={getPricingTypeIcon(priceData.appliedPricing?.type)}
              label={`${savingsPercentage}% OFF`}
              color={getPricingTypeColor(priceData.appliedPricing?.type)}
              size="small"
              sx={{ 
                fontWeight: 'bold',
                animation: priceData.appliedPricing?.type === 'flash_sale' ? 'pulse 2s infinite' : 'none',
                '@keyframes pulse': {
                  '0%': { transform: 'scale(1)' },
                  '50%': { transform: 'scale(1.05)' },
                  '100%': { transform: 'scale(1)' }
                }
              }}
            />
          )}
          
          <Typography variant="body2" color="success.main" fontWeight="medium">
            Save {formatCurrency(priceData.savings)}
          </Typography>
        </Box>
      )}

      {/* Applied Pricing Info */}
      {priceData.appliedPricing && (
        <Tooltip title={`Applied: ${priceData.appliedPricing.name}`}>
          <Typography 
            variant="caption" 
            color="text.secondary"
            sx={{ 
              display: 'block',
              fontStyle: 'italic',
              cursor: 'help'
            }}
          >
            {priceData.appliedPricing.type.replace('_', ' ').toUpperCase()} PRICE
          </Typography>
        </Tooltip>
      )}

      {/* Quantity Pricing */}
      {quantity > 1 && (
        <Box sx={{ mt: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Quantity: {quantity}
          </Typography>
          <Typography variant="body2" fontWeight="medium">
            Total: {formatCurrency(priceData.totalPrice)}
          </Typography>
          {priceData.savings > 0 && (
            <Typography variant="body2" color="success.main">
              Total Savings: {formatCurrency(priceData.savings * quantity)}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default DynamicPriceDisplay;