import { useGetTopProductsQuery } from "../../redux/api/productApiSlice";
import Message from "../../components/Message";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Box, Typography, Fade, Zoom } from "@mui/material";
import { Link } from "react-router-dom";

const ProductCarousel = () => {
  const { data: products, isLoading, error } = useGetTopProductsQuery();

  const settings = {
    dots: true,
    infinite: true,
    speed: 700,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    autoplay: true,
    autoplaySpeed: 3200,
    pauseOnHover: true,
    cssEase: "cubic-bezier(0.77, 0, 0.175, 1)",
  };

  return (
    <Box className="mb-4 lg:block xl:block md:block" sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
      {isLoading ? null : error ? (
        <Message variant="danger">
          {error?.data?.message || error.error}
        </Message>
      ) : (
        <Box sx={{ width: { xs: "100%", sm: 500, md: 700, lg: 800, xl: 900 } }}>
          <Slider {...settings}>
            {products.map(({ image, _id, name, price }) => (
              <Box key={_id} sx={{ px: 1, py: 2, position: "relative" }}>
                <Fade in timeout={900}>
                  <Box
                    sx={{
                      borderRadius: 4,
                      overflow: "hidden",
                      boxShadow: 6,
                      position: "relative",
                      background: "linear-gradient(90deg, #f8bbd0 0%, #e1bee7 100%)",
                    }}
                  >
                    <Zoom in timeout={1200}>
                      <Link to={`/product/${_id}`} style={{ textDecoration: "none" }}>
                      <img
                        src={image}
                        alt={name}
                        style={{
                          width: "100%",
                          height: "28rem",
                          objectFit: "cover",
                          borderRadius: "1.5rem",
                          filter: "brightness(0.97)",
                          transition: "filter 0.4s",
                        }}
                        className="carousel-img"
                      />
                      </Link>
                    </Zoom>
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 24,
                        left: 32,
                        bgcolor: "rgba(255,255,255,0.85)",
                        px: 3,
                        py: 1,
                        borderRadius: 3,
                        boxShadow: 2,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                      }}
                      component={Link}
                      to={`/product/${_id}`}
                    >
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 700,
                          color: "secondary.main",
                          textShadow: "1px 1px 8px #fff",
                        }}
                      >
                        {name.substring(0, 20)}
                      </Typography>
                      {price && (
                        <Typography
                          variant="subtitle1"
                          sx={{
                            color: "primary.main",
                            fontWeight: 600,
                            mt: 0.5,
                          }}
                        >
                          ${price}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Fade>
              </Box>
            ))}
          </Slider>
        </Box>
      )}
    </Box>
  );
};

export default ProductCarousel;
