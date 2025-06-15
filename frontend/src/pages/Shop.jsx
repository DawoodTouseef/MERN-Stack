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
  Chip,
  Stack,
  Fade,
  IconButton,
  Badge,
  Slide,
} from "@mui/material";
import { useParams } from "react-router-dom";
import {
  FaFilter,
  FaSyncAlt,
  FaTags,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import DocumentTitle from "react-document-title";

const Shop = () => {
  const { id: categoriesId } = useParams() || {};
  const dispatch = useDispatch();
  const { categories, products, checked, radio,searchQuery } = useSelector(
    (state) => state.shop
  );

  const categoriesQuery = useFetchCategoriesQuery();
  const [priceFilter, setPriceFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
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
        const filteredProducts = filteredProductsQuery.data.filter(
          (product) => {
            return (
              product.price.toString().includes(priceFilter) ||
              product.price === parseInt(priceFilter, 10)
            );
          }
        );
        dispatch(setProducts(filteredProducts));
      }
    }
  }, [checked, radio, filteredProductsQuery.data, dispatch, priceFilter]);
  

  useEffect(() => {
  // Filter products by search text
  if (searchQuery.trim() === "") {
    setFilteredProducts(products); // Reset to all products if search query is empty
  } else {
    setFilteredProducts(
      products.filter(
        (p) =>
          p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.brand?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }
}, [searchQuery, products]);
  const handleBrandClick = (brand) => {
    const productsByBrand = filteredProductsQuery.data?.filter(
      (product) => product.brand?.name === brand
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
          ?.map((product) => product.brand?.name)
          .filter((brand) => brand !== undefined)
      )
    ),
  ];

  const handlePriceChange = (e) => {
    setPriceFilter(e.target.value);
  };

  // Responsive filter toggle for mobile
  const handleFilterToggle = () => setShowFilters((prev) => !prev);

  return (
    <>
      <DocumentTitle title="Shop Products" />
      <Box
        sx={{
          maxWidth: "100vw",
          px: { xs: 1, md: 4 },
          py: 2,
          background: "linear-gradient(135deg, #f3e7e9 0%, #e3eeff 100%)",
          minHeight: "100vh",
        }}
      >
        {/* Header */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 2, mt: 1 }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <FaTags style={{ color: "#ec4899", fontSize: 28 }} />
            <Typography
              variant="h4"
              fontWeight="bold"
              sx={{
                color: "#18181b",
                letterSpacing: 0.5,
                textShadow: "1px 1px 8px #e3eeff",
              }}
            >
              Shop Products
            </Typography>
          </Stack>
          <Badge
            badgeContent={products.length}
            color="secondary"
            sx={{
              "& .MuiBadge-badge": {
                fontWeight: 700,
                fontSize: "1rem",
                background: "#ec4899",
                color: "#fff",
                boxShadow: "0 2px 8px #ec489955",
              },
            }}
          >
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<FaFilter />}
              onClick={handleFilterToggle}
              sx={{
                display: { xs: "flex", md: "none" },
                borderRadius: 2,
                fontWeight: 600,
                px: 2,
                py: 1,
                textTransform: "none",
                bgcolor: "#fff",
                boxShadow: "0 2px 8px #ec489933",
              }}
            >
              Filters
            </Button>
          </Badge>
        </Stack>

        {/* Main Content */}
        <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" } }}>
          {/* Sidebar Filters */}
          <Slide
            direction="down"
            in={showFilters || window.innerWidth >= 900}
            mountOnEnter
            unmountOnExit
          >
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
                display: { xs: showFilters ? "block" : "none", md: "block" },
                zIndex: 10,
                position: { xs: "absolute", md: "static" },
                left: 0,
                top: 70,
              }}
              className="shadow-lg"
            >
              {/* Filter by Categories */}
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography
                  variant="h6"
                  align="center"
                  sx={{
                    py: 1,
                    bgcolor: "#000",
                    borderRadius: 2,
                    mb: 2,
                    fontWeight: 700,
                    flex: 1,
                  }}
                >
                  Filter by Categories
                </Typography>
                <IconButton
                  onClick={handleFilterToggle}
                  sx={{
                    display: { xs: "flex", md: "none" },
                    color: "#fff",
                    ml: 1,
                  }}
                >
                  {showFilters ? <FaChevronUp /> : <FaChevronDown />}
                </IconButton>
              </Stack>
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

              {/* Filter by Brands */}
              <Typography
                variant="h6"
                align="center"
                sx={{
                  py: 1,
                  bgcolor: "#000",
                  borderRadius: 2,
                  mb: 2,
                  fontWeight: 700,
                }}
              >
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

              {/* Filter by Price */}
              <Typography
                variant="h6"
                align="center"
                sx={{
                  py: 1,
                  bgcolor: "#000",
                  borderRadius: 2,
                  mb: 2,
                  fontWeight: 700,
                }}
              >
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
                startIcon={<FaSyncAlt />}
                sx={{
                  my: 1,
                  borderRadius: 2,
                  fontWeight: 600,
                  letterSpacing: 1,
                  bgcolor: "#222",
                  color: "#fff",
                  "&:hover": {
                    bgcolor: "#ec4899",
                    color: "#fff",
                    borderColor: "#ec4899",
                  },
                }}
                className="hover:bg-secondary hover:text-white transition-colors"
                onClick={() => window.location.reload()}
              >
                Reset
              </Button>
            </Paper>
          </Slide>

          {/* Products Section */}
          <Box
            sx={{
              flexWrap: "wrap",
              gap: 3,
              p: 2,
              justifyContent: { xs: "center", md: "flex-start" },
              flex: 1,
              minHeight: 600,
              position: "relative",
            }}
          >
            {filteredProducts.length === 0 ? (
              <Loader />
            ) : (
              filteredProducts
                .filter((p) => !categoriesId || p.category?._id === categoriesId)
                .map((p) => (
                  <Fade in key={p._id}>
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
                      <ProductCard product={p} />
                      {p.countInStock === 0 && (
                        <Chip
                          label="Out of Stock"
                          color="error"
                          sx={{
                            position: "absolute",
                            top: 12,
                            left: 12,
                            fontWeight: 600,
                            fontSize: "0.95rem",
                            borderRadius: "999px",
                            zIndex: 2,
                            bgcolor: "#f87171",
                            color: "#fff",
                            boxShadow: "0 2px 8px #f8717166",
                          }}
                        />
                      )}
                    </Paper>
                  </Fade>
                ))
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default Shop;