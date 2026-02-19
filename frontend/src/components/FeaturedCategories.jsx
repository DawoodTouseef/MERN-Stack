import React from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  Tooltip,
  Button,
  useTheme,
  alpha,
  Paper
} from "@mui/material";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import CategoryIcon from "@mui/icons-material/Category";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const FeaturedCategories = ({ categories = [] }) => {
  const theme = useTheme();

  if (!categories.length) return null;

  return (
    <Box sx={{ mt: 6, mb: 5 }}>
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'center', md: 'flex-end' },
        mb: 5,
        textAlign: { xs: 'center', md: 'left' }
      }}>
        <Box>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 900,
              color: 'text.primary',
              letterSpacing: '-0.02em',
              lineHeight: 1.2
            }}
          >
            Shop by <Box component="span" sx={{ color: theme.palette.primary.main }}>Category</Box>
          </Typography>
          <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 400, mt: 1 }}>
            Find exactly what you're looking for by browsing our curated collections
          </Typography>
        </Box>
        <Button
          component={Link}
          to="/categories"
          endIcon={<ArrowForwardIcon />}
          sx={{
            mt: { xs: 3, md: 0 },
            fontWeight: 700,
            color: theme.palette.primary.main,
            '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) }
          }}
        >
          Explore All
        </Button>
      </Box>

      <Grid spacing={5} sx={{
        display: "block",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 5,
        textAlign: "center"
      }}>
        {categories.slice(0, 6).map((category, index) => (
          <Grid item xs={6} sm={4} md={2} key={category._id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -10 }}
            >
              <Card
                elevation={0}
                sx={{
                  borderRadius: 5,
                  overflow: "hidden",
                  bgcolor: "background.paper",
                  border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                  transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                  "&:hover": {
                    boxShadow: `0 20px 40px ${alpha(theme.palette.common.black, 0.1)}`,
                    borderColor: theme.palette.primary.main
                  },
                }}
              >
                <CardActionArea component={Link} to={`/shop/${category._id}`}>
                  <Box
                    sx={{
                      position: "relative",
                      height: 180,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: 'hidden'
                    }}
                  >
                    {category.image ? (
                      <Box
                        component="img"
                        src={category.image}
                        alt={category.name}
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          transition: 'transform 0.5s ease',
                          '&:hover': { transform: 'scale(1.1)' }
                        }}
                      />
                    ) : (
                      <Box sx={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: alpha(theme.palette.primary.main, 0.05)
                      }}>
                        <CategoryIcon sx={{ fontSize: 50, color: theme.palette.primary.main, opacity: 0.5 }} />
                      </Box>
                    )}

                    {/* Glassmorphic Overlay */}
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 12,
                        left: 12,
                        right: 12,
                        backdropFilter: 'blur(10px)',
                        background: alpha(theme.palette.background.paper, 0.8),
                        border: `1px solid ${alpha(theme.palette.common.white, 0.3)}`,
                        borderRadius: 2,
                        p: 1.5,
                        textAlign: "center",
                        boxShadow: 2
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 800,
                          color: 'text.primary',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          fontSize: '0.75rem'
                        }}
                      >
                        {category.name}
                      </Typography>
                    </Box>
                  </Box>
                </CardActionArea>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default FeaturedCategories;
