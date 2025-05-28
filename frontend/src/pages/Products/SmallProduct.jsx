import { Link } from "react-router-dom";
import HeartIcon from "./HeartIcon";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Chip,
  Box,
  Stack,
  Button,
  Tooltip,
} from "@mui/material";

const SmallProduct = ({ product }) => {
  const handleWriteReviewClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <Card
      sx={{
        width: 320,
        ml: 2,
        p: 2,
        borderRadius: 4,
        boxShadow: "0 4px 16px 0 rgba(236,72,153,0.10)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: 240,
        position: "relative",
        transition: "box-shadow 0.25s, transform 0.25s",
        "&:hover": {
          boxShadow: "0 8px 32px 0 rgba(236,72,153,0.18)",
          transform: "scale(1.025)",
          border: "2px solid #ec4899",
        },
        border: "2px solid transparent",
        background: "linear-gradient(135deg, #fff 80%, #e3eeff 100%)",
      }}
    >
      <Box sx={{ position: "relative" }}>
        <Button
          to={`/product/${product._id}`}
          component={Link}
          sx={{ p: 0, width: "100%", borderRadius: 2, overflow: "hidden" }}
          onClick={handleWriteReviewClick}
        >
          <CardMedia
            component="img"
            image={product.image}
            alt={product.name}
            sx={{
              width: "100%",
              height: 120,
              objectFit: "cover",
              borderRadius: 2,
              background: "#fff",
              transition: "filter 0.3s",
              "&:hover": {
                filter: "brightness(0.93) blur(0.5px)",
              },
            }}
          />
        </Button>
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
              fontSize: "0.85rem",
              borderRadius: "999px",
              zIndex: 2,
              bgcolor: "#f87171",
              color: "#fff",
              boxShadow: "0 2px 8px #f8717166",
            }}
          />
        )}
      </Box>
      <CardContent sx={{ p: 2, pt: 1 }}>
        <Link to={`/product/${product._id}`} style={{ textDecoration: "none" }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 0.5 }}
          >
            <Tooltip title={product?.name}>
              <Typography
                variant="subtitle1"
                sx={{
                  color: "#18181b",
                  fontWeight: 700,
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  maxWidth: 170,
                  letterSpacing: 0.1,
                  fontSize: "1.05rem",
                  "&:hover": { color: "#ec4899" },
                  transition: "color 0.2s",
                }}
              >
                {product?.name.length > 28
                  ? product?.name.substring(0, 28) + "..."
                  : product?.name}
              </Typography>
            </Tooltip>
            <Chip
              label={`$${product.price}`}
              sx={{
                bgcolor: "#f8bbd0",
                color: "#ad1457",
                fontWeight: 700,
                fontSize: "1rem",
                borderRadius: "999px",
                px: 1.5,
                boxShadow: "0 2px 8px #ec489955",
              }}
            />
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
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
              label={`Stock: ${product.countInStock}`}
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
        </Link>
      </CardContent>
    </Card>
  );
};

export default SmallProduct;
