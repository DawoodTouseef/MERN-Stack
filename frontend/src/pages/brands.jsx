import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Chip,
  Divider,
  TextField,
  InputAdornment,
  Pagination,
  Skeleton,
} from "@mui/material";
import { useState, useEffect } from "react";
import { FaSearch, FaStar, FaTag, FaShoppingCart } from "react-icons/fa";
import { useGetBrandsQuery } from "../redux/api/productsApiSlice";

const Brands = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredBrands, setFilteredBrands] = useState([]);
  const [page, setPage] = useState(1);
  const brandsPerPage = 12;

  // In a real implementation, you would use:
  const { data: brands, isLoading, isError } = useGetBrandsQuery();


  useEffect(() => {
    if (brands) {
      const filtered = brands.filter(brand =>
        brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        brand.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredBrands(filtered);
      setPage(1); // Reset to first page when search changes
    }
  }, [searchTerm, brands]);

  // Pagination logic
  const indexOfLastBrand = page * brandsPerPage;
  const indexOfFirstBrand = indexOfLastBrand - brandsPerPage;
  const currentBrands = filteredBrands.slice(indexOfFirstBrand, indexOfLastBrand);
  const totalPages = Math.ceil(filteredBrands.length / brandsPerPage);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  if (isError) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          py: { xs: 4, md: 8 },
          px: { xs: 2, md: 4 },
          background: "linear-gradient(135deg, #f3e7e9 0%, #e3eeff 100%)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Paper
          elevation={6}
          sx={{
            maxWidth: 900,
            width: "100%",
            mx: "auto",
            p: { xs: 3, md: 5 },
            borderRadius: 4,
            boxShadow: "0 8px 32px 0 rgba(236,72,153,0.15)",
            background: "#fff",
            textAlign: "center",
          }}
        >
          <Typography variant="h5" color="error" sx={{ mb: 2 }}>
            Error Loading Brands
          </Typography>
          <Typography variant="body1" sx={{ color: "#444", mb: 3 }}>
            We're having trouble loading our brand partners. Please try again later.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: { xs: 4, md: 8 },
        px: { xs: 2, md: 4 },
        background: "linear-gradient(135deg, #f3e7e9 0%, #e3eeff 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <Paper
        elevation={6}
        sx={{
          maxWidth: 1200,
          width: "100%",
          mx: "auto",
          p: { xs: 3, md: 5 },
          borderRadius: 4,
          boxShadow: "0 8px 32px 0 rgba(236,72,153,0.15)",
          background: "#fff",
        }}
      >
        <Typography
          variant="h3"
          fontWeight="bold"
          sx={{
            color: "#ec4899",
            mb: 2,
            letterSpacing: 0.5,
            textAlign: { xs: "center", md: "left" },
          }}
        >
          Our Brand Partners
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{ color: "#6366f1", mb: 4, textAlign: { xs: "center", md: "left" } }}
        >
          Discover products from leading global brands
        </Typography>

        {/* Search Bar */}
        <Box sx={{ mb: 4 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search brands..."
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FaSearch />
                </InputAdornment>
              ),
            }}
            sx={{
              bgcolor: "#f9fafb",
              borderRadius: 1,
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "#e3eeff",
                },
                "&:hover fieldset": {
                  borderColor: "#6366f1",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#ec4899",
                },
              },
            }}
          />
        </Box>

        {/* Featured Brands Section */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" fontWeight="bold" sx={{ color: "#18181b", mb: 3 }}>
            Featured Brands
          </Typography>
          <Divider sx={{ mb: 3, bgcolor: "#e3eeff" }} />
          
          <Grid container spacing={4}>
            {mockBrands
              .filter(brand => brand.featured)
              .slice(0, 4)
              .map((brand) => (
                <Grid item xs={12} sm={6} md={3} key={brand._id}>
                  <Card
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      borderRadius: 3,
                      boxShadow: 3,
                      transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
                      "&:hover": {
                        transform: "translateY(-5px)",
                        boxShadow: 6,
                      },
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="100"
                      image={brand.logo}
                      alt={brand.name}
                      sx={{ objectFit: "contain", p: 2 }}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography gutterBottom variant="h6" component="div" fontWeight="bold">
                        {brand.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {brand.description}
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                        <FaStar style={{ color: "#fbbf24", marginRight: 4 }} />
                        <Typography variant="body2" sx={{ mr: 2 }}>
                          {brand.rating}
                        </Typography>
                        <FaTag style={{ color: "#6366f1", marginRight: 4 }} />
                        <Typography variant="body2">
                          {brand.productCount} products
                        </Typography>
                      </Box>
                    </CardContent>
                    <CardActions sx={{ justifyContent: "center", pb: 2 }}>
                      <Button
                        size="small"
                        variant="contained"
                        sx={{
                          bgcolor: "#6366f1",
                          "&:hover": {
                            bgcolor: "#ec4899",
                          },
                        }}
                      >
                        Shop Now
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
          </Grid>
        </Box>

        {/* All Brands Section */}
        <Box>
          <Typography variant="h5" fontWeight="bold" sx={{ color: "#18181b", mb: 3 }}>
            All Brands
          </Typography>
          <Divider sx={{ mb: 3, bgcolor: "#e3eeff" }} />
          
          {isLoading ? (
            <Grid container spacing={4}>
              {[...Array(8)].map((_, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 3, mb: 1 }} />
                  <Skeleton variant="text" sx={{ fontSize: "1rem" }} />
                  <Skeleton variant="text" sx={{ fontSize: "0.875rem" }} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <>
              <Grid container spacing={4}>
                {currentBrands.map((brand) => (
                  <Grid item xs={12} sm={6} md={3} key={brand._id}>
                    <Card
                      sx={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        borderRadius: 3,
                        boxShadow: 2,
                        transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
                        "&:hover": {
                          transform: "translateY(-5px)",
                          boxShadow: 4,
                        },
                      }}
                    >
                      <CardMedia
                        component="img"
                        height="100"
                        image={brand.logo}
                        alt={brand.name}
                        sx={{ objectFit: "contain", p: 2 }}
                      />
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                          <Typography gutterBottom variant="h6" component="div" fontWeight="bold">
                            {brand.name}
                          </Typography>
                          {brand.featured && (
                            <Chip label="Featured" color="primary" size="small" />
                          )}
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {brand.description}
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                          <FaStar style={{ color: "#fbbf24", marginRight: 4 }} />
                          <Typography variant="body2" sx={{ mr: 2 }}>
                            {brand.rating}
                          </Typography>
                          <FaTag style={{ color: "#6366f1", marginRight: 4 }} />
                          <Typography variant="body2">
                            {brand.productCount} products
                          </Typography>
                        </Box>
                      </CardContent>
                      <CardActions sx={{ justifyContent: "center", pb: 2 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<FaShoppingCart />}
                          sx={{
                            color: "#6366f1",
                            borderColor: "#6366f1",
                            "&:hover": {
                              borderColor: "#ec4899",
                              color: "#ec4899",
                            },
                          }}
                        >
                          View Products
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {/* Pagination */}
              {totalPages > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                    siblingCount={1}
                    boundaryCount={1}
                  />
                </Box>
              )}

              {filteredBrands.length === 0 && searchTerm && (
                <Box sx={{ textAlign: "center", py: 6 }}>
                  <Typography variant="h6" sx={{ color: "#666", mb: 2 }}>
                    No brands found matching "{searchTerm}"
                  </Typography>
                  <Typography variant="body1" sx={{ color: "#999" }}>
                    Try adjusting your search terms
                  </Typography>
                </Box>
              )}
            </>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default Brands;