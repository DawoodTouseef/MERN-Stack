import { useSelector } from "react-redux";
import { Badge, Box } from "@mui/material";

const FavoritesCount = () => {
  const favorites = useSelector((state) => state.favorites);
  const favoriteCount = favorites.length;

  return (
    <Box sx={{ position: "absolute", left: 12, top: 32 }}>
      <Badge
        badgeContent={favoriteCount > 0 ? favoriteCount : null}
        color="secondary"
        sx={{
          "& .MuiBadge-badge": {
            fontSize: "0.85rem",
            minWidth: 20,
            height: 20,
            bgcolor: "#ec4899",
            color: "#fff",
            boxShadow: "0 2px 8px 0 rgba(236,72,153,0.25)",
            fontWeight: 700,
            border: "2px solid #fff",
            transition: "all 0.2s",
          },
        }}
        overlap="circular"
        showZero={false}
        anchorOrigin={{ vertical: "top", horizontal: "left" }}
      >
        {/* Empty child to just show badge */}
        <Box sx={{ width: 0, height: 0 }} />
      </Badge>
    </Box>
  );
};

export default FavoritesCount;
