import { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { useGetFilteredProductsQuery, useFacetedSearchQuery } from "../../../redux/api/productApiSlice";
import { useFetchCategoriesQuery } from "../../../redux/api/categoryApiSlice";
import { useGetBrandsQuery } from "../../../redux/api/brandApiSlice";
import { setCategories, setProducts, setSearchQuery } from "../../../redux/features/shop/shopSlice";

const useShopFilters = (categoriesId) => {
    const dispatch = useDispatch();
    const { checked, radio, searchQuery, products } = useSelector((state) => state.shop);

    const [searchParams, setSearchParams] = useSearchParams();

    const [viewMode, setViewMode] = useState('grid');
    const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'newest');
    const [sortOrder, setSortOrder] = useState(searchParams.get('sortOrder') || 'desc');
    const [page, setPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(12);
    const [showFilters, setShowFilters] = useState(false);
    const [enableInfiniteScroll, setEnableInfiniteScroll] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    // Debounced search query
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Initialize filters from URL
    const getInitialFilters = () => {
        const categories = searchParams.getAll('category');
        const brands = searchParams.getAll('brand');
        const minPrice = searchParams.get('minPrice');
        const maxPrice = searchParams.get('maxPrice');
        const rating = searchParams.get('rating');
        const availability = searchParams.get('availability');
        const discount = searchParams.get('discount');
        const delivery = searchParams.get('delivery');
        const seller = searchParams.get('seller');

        return {
            category: categories,
            brand: brands,
            priceRange: (minPrice && maxPrice) ? [parseInt(minPrice), parseInt(maxPrice)] : 'all',
            rating: rating ? parseInt(rating) : 0,
            availability: availability || 'all',
            discount: discount ? parseInt(discount) : 'all',
            delivery: delivery || 'all',
            seller: seller || 'all',
            offers: searchParams.getAll('offers'),
            features: searchParams.getAll('features')
        };
    };

    const [advancedFilters, setAdvancedFilters] = useState(getInitialFilters());

    // Effect to sync URL params to state (e.g. on direct navigation or back/forward)
    useEffect(() => {
        const initial = getInitialFilters();
        // Only update if filters actually changed to avoid unnecessary re-renders
        if (JSON.stringify(initial) !== JSON.stringify(advancedFilters)) {
            setAdvancedFilters(initial);
        }

        const urlSortBy = searchParams.get('sortBy') || 'newest';
        const urlSortOrder = searchParams.get('sortOrder') || 'desc';
        if (urlSortBy !== sortBy) setSortBy(urlSortBy);
        if (urlSortOrder !== sortOrder) setSortOrder(urlSortOrder);
    }, [searchParams]);

    // Sync state with URL
    useEffect(() => {
        const params = new URLSearchParams();

        if (searchQuery) params.set('q', searchQuery);
        if (sortBy !== 'newest') params.set('sortBy', sortBy);
        if (sortOrder !== 'desc') params.set('sortOrder', sortOrder);

        advancedFilters.category.forEach(c => params.append('category', c));
        advancedFilters.brand.forEach(b => params.append('brand', b));

        if (Array.isArray(advancedFilters.priceRange)) {
            params.set('minPrice', advancedFilters.priceRange[0]);
            params.set('maxPrice', advancedFilters.priceRange[1]);
        }

        if (advancedFilters.rating > 0) params.set('rating', advancedFilters.rating);
        if (advancedFilters.availability !== 'all') params.set('availability', advancedFilters.availability);
        if (advancedFilters.discount !== 'all') params.set('discount', advancedFilters.discount);
        if (advancedFilters.delivery !== 'all') params.set('delivery', advancedFilters.delivery);
        if (advancedFilters.seller !== 'all') params.set('seller', advancedFilters.seller);

        advancedFilters.offers.forEach(o => params.append('offers', o));
        advancedFilters.features.forEach(f => params.append('features', f));

        // Use setSearchParams but skip if already matching to prevent unnecessary history entries
        const currentParams = searchParams.toString();
        const newParamsStr = params.toString();
        if (currentParams !== newParamsStr) {
            setSearchParams(params, { replace: true });
        }
    }, [advancedFilters, searchQuery, sortBy, sortOrder, setSearchParams]);

    const categoriesQuery = useFetchCategoriesQuery();
    const brandsQuery = useGetBrandsQuery();

    const { selectedCurrency } = useSelector((state) => state.currency);

    const facetedSearchQuery = useFacetedSearchQuery({
        keyword: debouncedSearchQuery,
        category: advancedFilters.category.length > 0 ? advancedFilters.category : undefined,
        brand: advancedFilters.brand.length > 0 ? advancedFilters.brand : undefined,
        minPrice: Array.isArray(advancedFilters.priceRange) ? advancedFilters.priceRange[0] : undefined,
        maxPrice: Array.isArray(advancedFilters.priceRange) ? advancedFilters.priceRange[1] : undefined,
        rating: advancedFilters.rating > 0 ? advancedFilters.rating : undefined,
        availability: advancedFilters.availability !== 'all' ? advancedFilters.availability : undefined,
        discount: advancedFilters.discount !== 'all' ? advancedFilters.discount : undefined,
        delivery: advancedFilters.delivery !== 'all' ? advancedFilters.delivery : undefined,
        seller: advancedFilters.seller !== 'all' ? advancedFilters.seller : undefined,
        offers: advancedFilters.offers.length > 0 ? advancedFilters.offers : undefined,
        features: advancedFilters.features.length > 0 ? advancedFilters.features : undefined,
        currency: selectedCurrency,
        sortBy: sortBy,
        sortOrder: sortOrder,
        limit: enableInfiniteScroll ? 100 : 50
    });

    const filteredProductsQuery = useGetFilteredProductsQuery({ checked, radio });

    useEffect(() => {
        if (!categoriesQuery.isLoading && categoriesQuery.data) {
            dispatch(setCategories(categoriesQuery.data));
        }
    }, [categoriesQuery.data, categoriesQuery.isLoading, dispatch]);

    useEffect(() => {
        if (facetedSearchQuery.data) {
            dispatch(setProducts(facetedSearchQuery.data.products || []));
        } else if (!checked.length && !radio.length && !filteredProductsQuery.isLoading && filteredProductsQuery.data) {
            dispatch(setProducts(filteredProductsQuery.data));
        }
    }, [checked, radio, filteredProductsQuery.data, filteredProductsQuery.isLoading, dispatch, facetedSearchQuery.data]);

    const filteredProducts = useMemo(() => {
        let result = products;
        // Search filter matches backend logic if keyword is provided to hook
        // But facetedSearchQuery already does keyword search on backend
        // This local filtering might be redundant but keeping for safety/UI fluidity
        if (searchQuery.trim() !== "" && facetedSearchQuery.isFetching) {
            const query = searchQuery.toLowerCase();
            result = result.filter(p =>
                p.name?.toLowerCase().includes(query) ||
                p.brand?.name?.toLowerCase().includes(query) ||
                p.description?.toLowerCase().includes(query)
            );
        }
        if (categoriesId) {
            result = result.filter(p => p.category?._id === categoriesId);
        }
        return result;
    }, [searchQuery, products, categoriesId, facetedSearchQuery.isFetching]);

    const handleAdvancedFilterChange = (newFilters) => {
        setAdvancedFilters(newFilters);
        setPage(1);
        // Don't close filters on desktop
    };

    const handleAdvancedFilterClear = () => {
        setAdvancedFilters({
            category: [], brand: [], priceRange: 'all', rating: 0,
            availability: 'all', discount: 'all', delivery: 'all', seller: 'all',
            offers: [], features: []
        });
        setPage(1);
    };

    const handleSearch = (query) => {
        dispatch(setSearchQuery(query));
        setPage(1);
    };

    const handleSortChange = (newSortBy, newSortOrder) => {
        setSortBy(newSortBy);
        setSortOrder(newSortOrder || 'desc');
        setPage(1);
    };

    const toggleInfiniteScroll = () => {
        setEnableInfiniteScroll(!enableInfiniteScroll);
        setPage(1);
    };

    const loadMoreProducts = useCallback(() => {
        if (!hasMore || loadingMore) return;
        setLoadingMore(true);
        setTimeout(() => {
            setPage(prev => prev + 1);
            setLoadingMore(false);
        }, 1000);
    }, [hasMore, loadingMore]);

    const activeFiltersCount = useMemo(() => {
        let count = 0;
        if (advancedFilters.category.length > 0) count += advancedFilters.category.length;
        if (advancedFilters.brand.length > 0) count += advancedFilters.brand.length;
        if (advancedFilters.priceRange !== 'all') count += 1;
        if (advancedFilters.rating > 0) count += 1;
        if (advancedFilters.availability !== 'all') count += 1;
        if (advancedFilters.discount !== 'all') count += 1;
        if (advancedFilters.delivery !== 'all') count += 1;
        if (advancedFilters.seller !== 'all') count += 1;
        if (advancedFilters.offers.length > 0) count += advancedFilters.offers.length;
        if (advancedFilters.features.length > 0) count += advancedFilters.features.length;
        return count;
    }, [advancedFilters]);

    return {
        checked, radio, searchQuery, products: filteredProducts,
        viewMode, setViewMode,
        sortBy, sortOrder, handleSortChange,
        page, setPage,
        itemsPerPage, setItemsPerPage,
        showFilters, setShowFilters,
        enableInfiniteScroll, toggleInfiniteScroll,
        loadingMore, hasMore,
        advancedFilters, handleAdvancedFilterChange, handleAdvancedFilterClear,
        handleSearch, loadMoreProducts,
        isLoading: facetedSearchQuery.isLoading || filteredProductsQuery.isLoading || brandsQuery.isLoading,
        isError: facetedSearchQuery.isError || filteredProductsQuery.isError || brandsQuery.isError,
        error: facetedSearchQuery.error || filteredProductsQuery.error || brandsQuery.error,
        activeFiltersCount,
        categories: categoriesQuery.data || [],
        brands: brandsQuery.data || [],
        facets: facetedSearchQuery.data?.facets
    };
};

export default useShopFilters;
