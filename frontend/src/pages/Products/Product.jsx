import { Link } from "react-router-dom";
import HeartIcon from "./HeartIcon";
import {
  Box,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Chip,
  Fade,
  Stack,
  Tooltip,
} from "@mui/material";
import { useState } from "react";
import { useFetchCategoriesQuery } from "../../redux/api/categoryApiSlice";

const Product = ({ product }) => {
  const [hovered, setHovered] = useState(false);
  const { data: categories } = useFetchCategoriesQuery();
  return (
    <Fade in timeout={600}>
      <Card
        sx={{
          width: 480,
          ml: 4,
          p: 2,
          position: "relative",
          borderRadius: 3,
          boxShadow: hovered ? 8 : 3,
          transform: hovered ? "scale(1.025)" : "scale(1)",
          transition: "box-shadow 0.3s, transform 0.3s",
          bgcolor: "#fff",
          cursor: "pointer",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        elevation={hovered ? 8 : 3}
      >
        <Box sx={{ position: "relative" }}>
          <CardMedia
            component="img"
            image={product.image}
            alt={product.name}
            sx={{
              width: "100%",
              borderRadius: 2,
              height: 250,
              objectFit: "cover",
              filter: hovered ? "brightness(0.95) blur(0.5px)" : "none",
              transition: "filter 0.3s",
            }}
          />
          <Box sx={{ position: "absolute", top: 10, right: 10 }}>
            <HeartIcon product={product} />
          </Box>
          {product.countInStock === 0 && (
            <Chip
              label="Out of Stock"
              color="error"
              sx={{
                position: "absolute",
                top: 10,
                left: 10,
                fontWeight: 600,
                fontSize: "0.95rem",
                borderRadius: "999px",
                zIndex: 2,
              }}
            />
          )}
          {/* Show up to 3 more images as thumbnails */}
          {product.images && product.images.length > 1 && (
            <Stack
              direction="row"
              spacing={1}
              sx={{
                position: "absolute",
                bottom: 10,
                left: 10,
                zIndex: 2,
                bgcolor: "rgba(255,255,255,0.7)",
                borderRadius: 2,
                p: 0.5,
              }}
            >
              {product.images.slice(1, 4).map((img, idx) => (
                <Tooltip title="More image" key={idx}>
                  <img
                    src={img}
                    alt={`thumb-${idx}`}
                    style={{
                      width: 36,
                      height: 36,
                      objectFit: "cover",
                      borderRadius: 6,
                      border: "1px solid #eee",
                    }}
                  />
                </Tooltip>
              ))}
            </Stack>
          )}
        </Box>

        <CardContent sx={{ p: 2 }}>
          <Link to={`/product/${product._id}`} style={{ textDecoration: "none" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Tooltip title={product.name}>
                <Typography
                  variant="h6"
                  color="text.primary"
                  sx={{
                    fontWeight: 700,
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    maxWidth: 260,
                    letterSpacing: 0.2,
                    transition: "color 0.2s",
                    color: hovered ? "secondary.main" : "text.primary",
                  }}
                >
                  {product.name.length > 20 ? product.name.substring(0, 20) + "..." : product.name}
                </Typography>
              </Tooltip>
              <Chip
                label={`$${product.price}`}
                sx={{
                  bgcolor: "#f8bbd0",
                  color: "#ad1457",
                  fontWeight: 600,
                  fontSize: "1rem",
                  borderRadius: "999px",
                  boxShadow: hovered ? 2 : 0,
                  transition: "box-shadow 0.2s",
                }}
              />
            </Stack>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                minHeight: 38,
                maxHeight: 38,
                overflow: "hidden",
                textOverflow: "ellipsis",
                mb: 1,
                transition: "color 0.2s",
                color: hovered ? "primary.main" : "text.secondary",
              }}
            >
              {product.description?.substring(0, 60)}...
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1, flexWrap: "wrap" }}>
              <Chip
                label={product.brand}
                size="small"
                sx={{
                  bgcolor: "#e1bee7",
                  color: "#6a1b9a",
                  fontWeight: 500,
                  borderRadius: "999px",
                  fontSize: "0.85rem",
                }}
              />

              <Chip
                label={categories?.find((cat) => cat._id === product.category)?.name || "Uncategorized"} 
                size="small"
                sx={{
                  bgcolor: "#ffe082",
                  color: "#ff6f00",
                  fontWeight: 500,
                  borderRadius: "999px",
                  fontSize: "0.85rem",
                  ml: 1,
                }}
              />
              <Chip
                label={`Stock: ${product.countInStock}`}
                size="small"
                sx={{
                  bgcolor: "#c8e6c9",
                  color: "#388e3c",
                  fontWeight: 500,
                  borderRadius: "999px",
                  fontSize: "0.85rem",
                  ml: 1,
                }}
              />
            </Stack>
          </Link>
        </CardContent>
      </Card>
    </Fade>
  );
};

export default Product;
