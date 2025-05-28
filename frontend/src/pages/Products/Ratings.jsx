import { FaRegStar, FaStar, FaStarHalfAlt } from "react-icons/fa";
import { Box, Typography, Tooltip, Stack } from "@mui/material";

const Ratings = ({ value = 0, text, color }) => {
  const fullStars = Math.floor(value);
  const halfStars = value - fullStars >= 0.5 ? 1 : 0;
  const emptyStars = 5 - fullStars - halfStars;

  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        {[...Array(fullStars)].map((_, idx) => (
          <FaStar
            key={`full-${idx}`}
            style={{
              color: color || "#fbbf24",
              marginLeft: idx === 0 ? 0 : 2,
              fontSize: "1.25rem",
              filter: "drop-shadow(0 1px 4px #fbbf2433)",
            }}
          />
        ))}
        {halfStars === 1 && (
          <FaStarHalfAlt
            style={{
              color: color || "#fbbf24",
              marginLeft: fullStars > 0 ? 2 : 0,
              fontSize: "1.25rem",
              filter: "drop-shadow(0 1px 4px #fbbf2433)",
            }}
          />
        )}
        {[...Array(emptyStars)].map((_, idx) => (
          <FaRegStar
            key={`empty-${idx}`}
            style={{
              color: "#e5e7eb",
              marginLeft: 2,
              fontSize: "1.25rem",
            }}
          />
        ))}
      </Box>
      {text && (
        <Tooltip title={text}>
          <Typography
            variant="body2"
            sx={{
              ml: 1,
              color: "#18181b",
              fontWeight: 600,
              letterSpacing: 0.2,
              fontSize: "1.05rem",
              background: "linear-gradient(90deg,#f3e7e9 0%,#e3eeff 100%)",
              px: 1.2,
              py: 0.3,
              borderRadius: 2,
              boxShadow: "0 1px 4px #ec489933",
              display: "inline-block",
            }}
            className="shadcn-rating-text"
          >
            {text}
          </Typography>
        </Tooltip>
      )}
    </Stack>
  );
};

Ratings.defaultProps = {
  color: "#fbbf24", // MUI yellow-400
};

export default Ratings;
