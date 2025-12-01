import { useFetchCategoriesQuery } from "../redux/api/categoryApiSlice";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import CategoryIcon from "@mui/icons-material/Category";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6 },
  }),
};

const Categories = () => {
  const { data: categories, isLoading, isError, error } = useFetchCategoriesQuery();
  
  return (
    <Box sx={{ maxWidth: "1200px", mx: "auto", mt: 6, px: 2 }}>
      <Typography
        variant="h4"
        fontWeight="bold"
        sx={{ mb: 4, textAlign: "center", color: "primary.main" }}
      >
        Categories
      </Typography>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <CircularProgress />
        </Box>
      ) : isError ? (
        <Typography variant="body1" color="error" sx={{ textAlign: "center" }}>
          {error?.data?.message || "Failed to load categories"}
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {categories?.map((category, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={category._id || index}>
              <motion.div
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                custom={index}
                whileHover={{ scale: 1.05, rotateZ: 1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card
                  sx={{
                    borderRadius: 4,
                    overflow: "hidden",
                    boxShadow: 3,
                    transition: "transform 0.3s ease",
                    "&:hover": { boxShadow: 6 },
                  }}
                >
                  <CardActionArea component={Link} to={`/shop/${category._id}`}>
                    <Box
                      sx={{
                        position: "relative",
                        height: 140,
                        backgroundColor: "#f1f1f1",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {category.image ? (
                        <>
                          <img
                            src={category.image}
                            alt={category.name}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                          <Box
                            sx={{
                              position: "absolute",
                              bottom: 0,
                              width: "100%",
                              background:
                                "linear-gradient(to top, rgba(0,0,0,0.6), transparent)",
                              color: "#fff",
                              p: 1,
                              textAlign: "center",
                            }}
                          >
                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                              {category.name}
                            </Typography>
                          </Box>
                        </>
                      ) : (
                        <CategoryIcon fontSize="large" color="primary" sx={{ fontSize: 48 }} />
                      )}
                    </Box>
                    <CardContent>
                      <Tooltip title={category.name}>
                        <Typography
                          variant="body1"
                          noWrap
                          align="center"
                          sx={{
                            textTransform: "capitalize",
                            fontWeight: 600,
                            color: "text.primary",
                          }}
                        >
                          {category.name}
                        </Typography>
                      </Tooltip>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default Categories;