import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
    useGetProductDetailsQuery,
    useCreateReviewMutation,
} from "../../../redux/api/productApiSlice";
import { useFetchOffersQuery } from "../../../redux/api/offerApiSlice";
import { addToCart } from "../../../redux/features/cart/cartSlice";
import {
    getVariant,
    getAvailableOptions,
    formatVariantAttributes,
    getVariantField,
    isVariantInStock,
    getVariantPrice,
    getVariantImages,
    hasVariants,
    getVariantSku,
    getVariantShippingDetails
} from "../../../Utils/variantUtils";
import axios from "axios";

const useProductLogic = () => {
    const { id: productId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [qty, setQty] = useState(1);
    const [selectedOptions, setSelectedOptions] = useState({});
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [taxInfo, setTaxInfo] = useState(null);
    const [offerpercent, setofferpercent] = useState({
        percentage: "",
        end: ""
    });

    const { data: product, isLoading, error, refetch } = useGetProductDetailsQuery(productId);
    const { data: offers } = useFetchOffersQuery();
    const { userInfo } = useSelector((state) => state.auth);
    const [createReview, { isLoading: loadingProductReview }] = useCreateReviewMutation();

    // Reset selection when product changes
    useEffect(() => {
        setSelectedOptions({});
        setSelectedVariant(null);
        setQty(1);
    }, [productId]);

    // Update variant when product or selected options change
    useEffect(() => {
        if (product && hasVariants(product)) {
            const variant = getVariant(product, selectedOptions);
            setSelectedVariant(variant);
        } else {
            setSelectedVariant(null);
        }
    }, [product, selectedOptions]);

    // Calculate offers
    useEffect(() => {
        if (offers && product) {
            offers.forEach((offer) => {
                if (
                    imageMatchesOffer(offer, product) &&
                    offer.discountUnit === "percent"
                ) {
                    setofferpercent({
                        percentage: offer.discountValue,
                        end: offer.endTime,
                    });
                }
            });
        }
    }, [offers, product]);

    const imageMatchesOffer = (offer, product) => {
        return (
            offer.products?.some((p) => p._id === product._id) ||
            offer.categories?.some((c) => c._id === product.category) ||
            (offer.brand && offer.brand._id === product.brand)
        );
    };

    // Fetch Tax info
    useEffect(() => {
        const fetchTaxInfo = async () => {
            if (!product) return;
            try {
                const currentPrice = getCurrentPrice();
                const { data } = await axios.post('/api/tax/calculate-advanced', {
                    productId: product._id,
                    price: currentPrice,
                    quantity: qty,
                    shippingAddress: {
                        country: 'US',
                        zipCode: '10001'
                    },
                    useThirdPartyService: true
                });
                setTaxInfo(data);
            } catch (err) {
                console.error("Failed to fetch tax info", err);
            }
        };
        fetchTaxInfo();
    }, [product, qty, selectedVariant]);

    // Helpers
    const getCurrentPrice = () => {
        return getVariantField(selectedVariant, product, 'price') || 0;
    };

    const getCurrentName = () => {
        return getVariantField(selectedVariant, product, 'name');
    };

    const getCurrentDescription = () => {
        return getVariantField(selectedVariant, product, 'description');
    };

    const getCurrentSpecifications = () => {
        return getVariantField(selectedVariant, product, 'specifications');
    };

    const getCurrentImages = () => {
        if (selectedVariant) {
            return getVariantImages(selectedVariant, product);
        }
        return product?.media?.map(m => m.url) || [];
    };

    const getCurrentStock = () => {
        return selectedVariant ? selectedVariant.countInStock : (product?.countInStock || 0);
    };

    const isInStock = () => {
        return selectedVariant ? isVariantInStock(selectedVariant) : (product?.countInStock > 0);
    };

    const handleOptionSelect = (optionType, value) => {
        setSelectedOptions(prev => ({
            ...prev,
            [optionType]: value
        }));
    };

    const handleAddToCart = (redirectPath = "/cart") => {
        if (hasVariants(product) && !selectedVariant) {
            toast.error("Please select all options before adding to cart");
            return;
        }

        const cartItem = {
            ...product,
            qty,
            ...(selectedVariant && {
                _id: `${product._id}-${selectedVariant._id}`,
                variantId: selectedVariant._id,
                sku: getVariantSku(selectedVariant),
                name: getCurrentName(),
                price: getCurrentPrice(),
                media: getVariantImages(selectedVariant, product).map(url => ({ url })),
                countInStock: selectedVariant.countInStock,
                selectedOptions: selectedOptions
            })
        };

        dispatch(addToCart(cartItem));

        if (redirectPath === "/cart") {
            toast.success("Added to cart!", { autoClose: 1800 });
        }
        navigate(redirectPath);
    };

    const availableOptions = product ? getAvailableOptions(product) : {};

    return {
        product,
        isLoading,
        error,
        qty,
        setQty,
        selectedOptions,
        selectedVariant,
        handleOptionSelect,
        addToCartHandler: () => handleAddToCart("/cart"),
        addToShippingHandler: () => handleAddToCart("/shipping"),
        getCurrentImages,
        getCurrentStock,
        getCurrentName,
        getCurrentDescription,
        getCurrentSpecifications,
        isInStock,
        getCurrentPrice,
        availableOptions,
        userInfo,
        taxInfo,
        offerpercent,
        hasVariants: product ? hasVariants(product) : false,
        formatVariantAttributes,
        getVariantSku,
        getVariantShippingDetails,
        refetch,
        rating,
        setRating,
        comment,
        setComment,
        createReview,
        loadingProductReview,
        getVariantPrice,
        isOwnProduct: userInfo && product && (
            (typeof product.user === 'string' && product.user === userInfo._id) ||
            (typeof product.user === 'object' && product.user._id === userInfo._id)
        )
    };
};

export default useProductLogic;
