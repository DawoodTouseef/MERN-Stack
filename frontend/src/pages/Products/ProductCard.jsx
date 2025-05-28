import { Link } from "react-router-dom";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { useDispatch } from "react-redux";
import { addToCart } from "../../redux/features/cart/cartSlice";
import { toast } from "react-toastify";
import HeartIcon from "./HeartIcon";
import { Box, Button, IconButton, Chip, Tooltip, Stack, Typography, Fade } from "@mui/material";
import { useState } from "react";
import { useFetchCategoriesQuery } from "../../redux/api/categoryApiSlice";

const ProductCard = ({ p }) => {
  const dispatch = useDispatch();
  const [hovered, setHovered] = useState(false);
  const { data: categories } = useFetchCategoriesQuery();
  const addToCartHandler = (product, qty) => {
    dispatch(addToCart({ ...product, qty }));
    toast.success("Item added successfully", {
      position: toast.POSITION.TOP_RIGHT,
      autoClose: 2000,
    });
  };

  return (
    <Fade in timeout={500}>
      <Box
        className="relative"
        sx={{
          maxWidth: 340,
          minHeight: 420,
          bgcolor: "#18181b",
          borderRadius: 4,
          boxShadow: hovered ? 8 : 2,
          overflow: "hidden",
          transition: "box-shadow 0.25s, transform 0.25s",
          transform: hovered ? "scale(1.03)" : "scale(1)",
          border: hovered ? "2px solid #ec4899" : "2px solid transparent",
          "&:hover": {
            boxShadow: 12,
            borderColor: "#ec4899",
          },
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <Box sx={{ position: "relative" }}>
          <Link to={`/product/${p._id}`}>
            <img
              className="cursor-pointer w-full"
              src={p.image}
              alt={p.name}
              style={{
                height: "200px",
                objectFit: "cover",
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
                filter: hovered ? "brightness(0.93) blur(0.5px)" : "none",
                transition: "filter 0.3s",
                boxShadow: hovered ? "0 4px 24px #ec489955" : "none",
              }}
            />
            <Chip
              label={p.brand}
              size="small"
              sx={{
                position: "absolute",
                bottom: 12,
                right: 12,
                bgcolor: "#fce7f3",
                color: "#ec4899",
                fontWeight: 600,
                fontSize: "0.85rem",
                borderRadius: "999px",
                px: 1.5,
                boxShadow: "0 2px 8px #ec489955",
              }}
            />
          </Link>
          <Box sx={{ position: "absolute", top: 12, right: 12 }}>
            <HeartIcon product={p} />
          </Box>
        </Box>

        <Box sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Tooltip title={p.name}>
              <Typography
                variant="h6"
                sx={{
                  color: "#fff",
                  fontWeight: 700,
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  maxWidth: 180,
                  letterSpacing: 0.2,
                  transition: "color 0.2s",
                  "&:hover": { color: "#ec4899" },
                }}
                component={Link}
              to={`/product/${p._id}`}
              >
                {p?.name.length > 22 ? p?.name.substring(0, 22) + "..." : p?.name}
              </Typography>
            </Tooltip>
            <Chip
              label={p?.price?.toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
              })}
              sx={{
                bgcolor: "#f8bbd0",
                color: "#ad1457",
                fontWeight: 600,
                fontSize: "1rem",
                borderRadius: "999px",
                px: 2,
                py: 0.5,
                boxShadow: hovered ? 2 : 0,
                transition: "box-shadow 0.2s",
              }}
            />
          </Stack>

          <Typography
            variant="body2"
            sx={{
              color: "#cfcfcf",
              minHeight: 38,
              maxHeight: 38,
              overflow: "hidden",
              textOverflow: "ellipsis",
              mb: 1,
              fontWeight: 400,
            }}
          >
            {p?.description?.substring(0, 60)}...
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1, mb: 2 }}>
            <Chip
              label={categories?.find((cat) => cat._id === p.category)?.name || "Uncategorized"}
              size="small"
              sx={{
                bgcolor: "#ffe082",
                color: "#ff6f00",
                fontWeight: 500,
                borderRadius: "999px",
                fontSize: "0.85rem",
              }}
            />
            <Chip
              label={`Stock: ${p.countInStock}`}
              size="small"
              sx={{
                bgcolor: "#c8e6c9",
                color: "#388e3c",
                fontWeight: 500,
                borderRadius: "999px",
                fontSize: "0.85rem",
              }}
            />
          </Stack>

          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Button
              component={Link}
              to={`/product/${p._id}`}
              variant="contained"
              color="secondary"
              endIcon={
                <svg
                  width="18"
                  height="18"
                  style={{ marginLeft: 4 }}
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 10"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M1 5h12m0 0L9 1m4 4L9 9"
                  />
                </svg>
              }
              sx={{
                textTransform: "none",
                fontWeight: 500,
                borderRadius: 2,
                px: 2.5,
                py: 1,
                fontSize: "0.95rem",
                backgroundColor: "#d81b60",
                "&:hover": { backgroundColor: "#ad1457" },
                boxShadow: 2,
                transition: "all 0.2s",
              }}
            >
              Read More
            </Button>

            <Tooltip title="Add to Cart" arrow>
              <IconButton
                color="primary"
                onClick={() => addToCartHandler(p, 1)}
                sx={{
                  bgcolor: "#f8bbd0",
                  "&:hover": { bgcolor: "#f06292", transform: "scale(1.12)" },
                  transition: "all 0.2s",
                  ml: 1,
                }}
              >
                <AiOutlineShoppingCart size={25} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>
    </Fade>
  );
};

export default ProductCard;
