import { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useGetFilteredProductsQuery, useFacetedSearchQuery } from "../../../redux/api/productApiSlice";
import { useFetchCategoriesQuery } from "../../../redux/api/categoryApiSlice";
import { setCategories, setProducts, setSearchQuery } from "../../../redux/features/shop/shopSlice";

const useShopFilters = (categoriesId) => {
    const dispatch = useDispatch();
    const { checked, radio, searchQuery, products } = useSelector((state) => state.shop);

    const [priceFilter, setPriceFilter] = useState("");
    const [viewMode, setViewMode] = useState('grid');
    const [sortBy, setSortBy] = useState('newest');
    const [page, setPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(12);
    const [showFilters, setShowFilters] = useState(false);
    const [enableInfiniteScroll, setEnableInfiniteScroll] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const [advancedFilters, setAdvancedFilters] = useState({
        category: [],
        brand: [],
        priceRange: 'all',
        rating: 0,
        availability: 'all',
        delivery: 'all',
        seller: 'all',
        offers: [],
        features: []
    });

    const categoriesQuery = useFetchCategoriesQuery();

    const facetedSearchQuery = useFacetedSearchQuery({
        keyword: searchQuery,
        category: advancedFilters.category.length > 0 ? advancedFilters.category : undefined,
        brand: advancedFilters.brand.length > 0 ? advancedFilters.brand : undefined,
        priceRange: advancedFilters.priceRange !== 'all' ? advancedFilters.priceRange : undefined,
        rating: advancedFilters.rating > 0 ? advancedFilters.rating : undefined,
        availability: advancedFilters.availability !== 'all' ? advancedFilters.availability : undefined,
        delivery: advancedFilters.delivery !== 'all' ? advancedFilters.delivery : undefined,
        seller: advancedFilters.seller !== 'all' ? advancedFilters.seller : undefined,
        offers: advancedFilters.offers.length > 0 ? advancedFilters.offers : undefined,
        features: advancedFilters.features.length > 0 ? advancedFilters.features : undefined,
        sortBy: sortBy,
        sortOrder: 'desc',
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
            const filtered = filteredProductsQuery.data.filter(p =>
                p.price.toString().includes(priceFilter) || p.price === parseInt(priceFilter, 10)
            );
            dispatch(setProducts(filtered));
        }
    }, [checked, radio, filteredProductsQuery.data, filteredProductsQuery.isLoading, dispatch, priceFilter, facetedSearchQuery.data]);

    const filteredProducts = useMemo(() => {
        let result = products;
        if (searchQuery.trim() !== "") {
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
    }, [searchQuery, products, categoriesId]);

    const handleAdvancedFilterChange = (newFilters) => {
        setAdvancedFilters(newFilters);
        setPage(1);
        setShowFilters(false);
    };

    const handleAdvancedFilterClear = () => {
        setAdvancedFilters({
            category: [], brand: [], priceRange: 'all', rating: 0,
            availability: 'all', delivery: 'all', seller: 'all',
            offers: [], features: []
        });
        setPage(1);
    };

    const handleSearch = (query) => {
        dispatch(setSearchQuery(query));
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
        return Object.values(advancedFilters).reduce((count, filter) => {
            if (Array.isArray(filter)) return count + filter.length;
            if (typeof filter === 'string' && filter !== 'all') return count + 1;
            if (typeof filter === 'number' && filter > 0) return count + 1;
            return count;
        }, 0);
    }, [advancedFilters]);

    return {
        checked, radio, searchQuery, products: filteredProducts,
        priceFilter, setPriceFilter,
        viewMode, setViewMode,
        sortBy, setSortBy,
        page, setPage,
        itemsPerPage, setItemsPerPage,
        showFilters, setShowFilters,
        enableInfiniteScroll, toggleInfiniteScroll,
        loadingMore, hasMore,
        advancedFilters, handleAdvancedFilterChange, handleAdvancedFilterClear,
        handleSearch, loadMoreProducts,
        isLoading: facetedSearchQuery.isLoading || filteredProductsQuery.isLoading,
        isError: facetedSearchQuery.isError || filteredProductsQuery.isError,
        error: facetedSearchQuery.error || filteredProductsQuery.error,
        activeFiltersCount,
        categories: categoriesQuery.data || []
    };
};

export default useShopFilters;
