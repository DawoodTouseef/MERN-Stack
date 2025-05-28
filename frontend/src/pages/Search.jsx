import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useGetFilteredProductsQuery } from "../redux/api/productApiSlice";
import { useFetchCategoriesQuery } from "../redux/api/categoryApiSlice";
import {
  setCategories,
  setProducts,
  setChecked,
} from "../redux/features/shop/shopSlice";
import Loader from "../components/Loader";
import ProductCard from "./Products/ProductCard";
import {
  Box,
  Typography,
  Checkbox,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormGroup,
  TextField,
  Button,
  Paper,
  Divider,
} from "@mui/material";
import { useNavigate, useParams, } from "react-router-dom";
import DocumentTitle from "react-document-title";

const Search = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { searchText: searchParam } = useParams();
  const { categories, products, checked, radio } = useSelector(
    (state) => state.shop
  );

  const categoriesQuery = useFetchCategoriesQuery();
  const [priceFilter, setPriceFilter] = useState("");
  const [searchText, setSearchText] = useState(searchParam || "");
  const [filteredProducts, setFilteredProducts] = useState([]);

  const filteredProductsQuery = useGetFilteredProductsQuery({
    checked,
    radio,
  });

  useEffect(() => {
    if (!categoriesQuery.isLoading) {
      dispatch(setCategories(categoriesQuery.data));
    }
  }, [categoriesQuery.data, dispatch]);

  useEffect(() => {
    if (!checked.length || !radio.length) {
      if (!filteredProductsQuery.isLoading) {
        const filtered = filteredProductsQuery.data.filter(
          (product) => {
            return (
              product.price.toString().includes(priceFilter) ||
              product.price === parseInt(priceFilter, 10)
            );
          }
        );
        dispatch(setProducts(filtered));
        setFilteredProducts(filtered);
      }
    }
  }, [checked, radio, filteredProductsQuery.data, dispatch, priceFilter]);

  useEffect(() => {
    // Filter products by search text
    if (searchText.trim() === "") {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(
        products.filter(
          (p) =>
            p.name?.toLowerCase().includes(lower) ||
            p.brand?.toLowerCase().includes(lower) ||
            p.description?.toLowerCase().includes(lower)
        )
      );
    }
  }, [searchText, products]);

  const handleBrandClick = (brand) => {
    const productsByBrand = filteredProductsQuery.data?.filter(
      (product) => product.brand === brand
    );
    dispatch(setProducts(productsByBrand));
  };

  const handleCheck = (value, id) => {
    const updatedChecked = value
      ? [...checked, id]
      : checked.filter((c) => c !== id);
    dispatch(setChecked(updatedChecked));
  };

  const uniqueBrands = [
    ...Array.from(
      new Set(
        filteredProductsQuery.data
          ?.map((product) => product.brand)
          .filter((brand) => brand !== undefined)
      )
    ),
  ];

  const handlePriceChange = (e) => {
    setPriceFilter(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchText.trim()) {
      navigate(`/search/${encodeURIComponent(searchText.trim())}`);
    }
  };

  // Optionally, update searchText if the URL param changes:
  useEffect(() => {
    setSearchText(searchParam || "");
  }, [searchParam]);
  
  return (
    <DocumentTitle title={`Search - ${searchText || "Products"} `}>
    <Box
      sx={{
        maxWidth: "100vw",
        px: { xs: 1, md: 4 },
        py: 2,
        background: "linear-gradient(135deg, #f3e7e9 0%, #e3eeff 100%)",
        minHeight: "100vh",
      }}
    >
      <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" } }}>
        {/* Sidebar Filters */}
        <Paper
          elevation={4}
          sx={{
            bgcolor: "#18181b",
            color: "#fff",
            p: 3,
            mt: 2,
            mb: 2,
            minWidth: { xs: "100%", md: 260 },
            maxWidth: { xs: "100%", md: 300 },
            mr: { md: 4 },
            borderRadius: 4,
            boxShadow: "0 4px 24px 0 rgba(0,0,0,0.12)",
          }}
          className="shadow-lg"
        >
          <Typography variant="h6" align="center" sx={{ py: 1, bgcolor: "#000", borderRadius: 2, mb: 2, fontWeight: 700 }}>
            Filter by Categories
          </Typography>
          <FormGroup sx={{ pl: 1 }}>
            {categories?.map((c) => (
              <FormControlLabel
                key={c._id}
                control={
                  <Checkbox
                    checked={checked.includes(c._id)}
                    onChange={(e) => handleCheck(e.target.checked, c._id)}
                    sx={{
                      color: "secondary.main",
                      "&.Mui-checked": { color: "secondary.main" },
                    }}
                    className="transition-colors"
                  />
                }
                label={
                  <Typography variant="body2" color="#fff" className="font-medium">
                    {c.name}
                  </Typography>
                }
              />
            ))}
          </FormGroup>

          <Divider sx={{ my: 2, bgcolor: "#333" }} />

          <Typography variant="h6" align="center" sx={{ py: 1, bgcolor: "#000", borderRadius: 2, mb: 2, fontWeight: 700 }}>
            Filter by Brands
          </Typography>
          <RadioGroup
            name="brand"
            onChange={(e) => handleBrandClick(e.target.value)}
            sx={{ pl: 1 }}
          >
            {uniqueBrands?.map((brand) => (
              <FormControlLabel
                key={brand}
                value={brand}
                control={
                  <Radio
                    sx={{
                      color: "secondary.main",
                      "&.Mui-checked": { color: "secondary.main" },
                    }}
                    className="transition-colors"
                  />
                }
                label={
                  <Typography variant="body2" color="#fff" className="font-medium">
                    {brand}
                  </Typography>
                }
              />
            ))}
          </RadioGroup>

          <Divider sx={{ my: 2, bgcolor: "#333" }} />

          <Typography variant="h6" align="center" sx={{ py: 1, bgcolor: "#000", borderRadius: 2, mb: 2, fontWeight: 700 }}>
            Filter by Price
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Enter Price"
            value={priceFilter}
            onChange={handlePriceChange}
            sx={{
              bgcolor: "#222",
              input: { color: "#fff" },
              mb: 2,
              borderRadius: 2,
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#444" },
                "&:hover fieldset": { borderColor: "secondary.main" },
                "&.Mui-focused fieldset": { borderColor: "secondary.main" },
              },
            }}
            className="transition-all"
          />

          <Button
            fullWidth
            variant="outlined"
            color="secondary"
            sx={{
              my: 1,
              borderRadius: 2,
              fontWeight: 600,
              letterSpacing: 1,
            }}
            className="hover:bg-secondary hover:text-white transition-colors"
            onClick={() => window.location.reload()}
          >
            Reset
          </Button>
        </Paper>

        {/* Products Section */}
        <Box sx={{ flex: 1, p: 2 }}>
          <Typography variant="h5" align="center" sx={{ mb: 2, fontWeight: 700, color: "primary.main" }}>
            {filteredProducts?.length} Products Found
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 3,
              justifyContent: { xs: "center", md: "flex-start" },
            }}
          >
            {filteredProducts.length === 0 ? (
              <Loader />
            ) : (
              filteredProducts?.map((p) => (
                <Paper
                  key={p._id}
                  elevation={6}
                  sx={{
                    p: 2,
                    borderRadius: 4,
                    bgcolor: "#fff",
                    minWidth: 260,
                    maxWidth: 320,
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "translateY(-8px) scale(1.03)",
                      boxShadow: 10,
                      borderColor: "secondary.main",
                    },
                    boxShadow: "0 4px 24px 0 rgba(0,0,0,0.10)",
                  }}
                  className="hover:scale-105 hover:shadow-2xl transition-transform duration-200"
                >
                  <ProductCard p={p} />
                </Paper>
              ))
            )
            }
    
          </Box>
        </Box>
      </Box>
    </Box>
    </DocumentTitle>
  );
};

export default Search;