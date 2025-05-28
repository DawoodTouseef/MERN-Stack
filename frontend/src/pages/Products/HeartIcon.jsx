import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { IconButton, Tooltip, Zoom } from "@mui/material";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import {
  addToFavorites,
  removeFromFavorites,
  setFavorites,
} from "../../redux/features/favorites/favoriteSlice";
import {
  addFavoriteToLocalStorage,
  getFavoritesFromLocalStorage,
  removeFavoriteFromLocalStorage,
} from "../../Utils/localStorage";
import { Box } from "@mui/material";

const HeartIcon = ({ product }) => {
  const dispatch = useDispatch();
  const favorites = useSelector((state) => state.favorites) || [];
  const isFavorite = favorites.some((p) => p._id === product._id);

  useEffect(() => {
    const favoritesFromLocalStorage = getFavoritesFromLocalStorage();
    dispatch(setFavorites(favoritesFromLocalStorage));
    // eslint-disable-next-line
  }, []);

  const toggleFavorites = () => {
    if (isFavorite) {
      dispatch(removeFromFavorites(product));
      removeFavoriteFromLocalStorage(product._id);
    } else {
      dispatch(addToFavorites(product));
      addFavoriteToLocalStorage(product);
    }
  };

  return (
    <Box
      sx={{
        position: "absolute",
        top: 14,
        right: 20,
        zIndex: 10,
        borderRadius: "50%",
        boxShadow: isFavorite
          ? "0 2px 12px 0 rgba(236,72,153,0.25)"
          : "0 2px 8px 0 rgba(0,0,0,0.10)",
        bgcolor: isFavorite ? "#fce7f3" : "rgba(24,24,24,0.7)",
        transition: "all 0.2s",
        "&:hover": {
          bgcolor: "#fff",
          boxShadow: "0 4px 16px 0 rgba(236,72,153,0.18)",
        },
      }}
    >
      <Tooltip
        title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
        arrow
        TransitionComponent={Zoom}
        placement="top"
      >
        <IconButton
          onClick={toggleFavorites}
          sx={{
            color: isFavorite ? "#ec4899" : "#a1a1aa",
            transition: "color 0.2s, transform 0.2s",
            "&:hover": {
              color: "#ec4899",
              transform: "scale(1.15)",
            },
            fontSize: 28,
          }}
          size="large"
        >
          {isFavorite ? <FaHeart /> : <FaRegHeart />}
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default HeartIcon;
