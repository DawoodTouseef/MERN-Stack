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
  Alert,
  Link,
  TextField,
  InputAdornment,
  Pagination,
  Skeleton,
  CircularProgress,
} from "@mui/material";
import { useState, useEffect } from "react";
import { Search, CalendarToday, Person, Category } from "@mui/icons-material";
import { useFetchBlogPostsQuery } from "../redux/api/blogApiSlice";

const Blog = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { data, isLoading, isError, error, refetch } = useFetchBlogPostsQuery({
    page: currentPage,
    limit: 6,
    search: searchQuery
  });

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Extract blog posts and pagination info from data
  const posts = data?.posts || [];
  const totalPages = data?.totalPages || 1;

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
          Nexus Mart Blog
        </Typography>
        
        <Typography
          variant="subtitle1"
          sx={{ color: "#6366f1", mb: 4, textAlign: { xs: "center", md: "left" } }}
        >
          Insights, tips, and stories from our team and community
        </Typography>

        <Alert severity="info" sx={{ mb: 4 }}>
          <Typography variant="body1">
            <strong>Stay Informed:</strong> Subscribe to our newsletter to get the latest blog posts delivered directly to your inbox.
          </Typography>
        </Alert>

        <TextField
          fullWidth
          placeholder="Search blog posts..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1); // Reset to first page when searching
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 4 }}
        />

        {isLoading && (
          <Grid container spacing={4}>
            {[...Array(6)].map((_, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card sx={{ height: '100%' }}>
                  <Skeleton variant="rectangular" height={200} />
                  <CardContent>
                    <Skeleton variant="text" sx={{ fontSize: '1.5rem', mb: 1 }} />
                    <Skeleton variant="text" sx={{ fontSize: '1rem', mb: 2 }} />
                    <Skeleton variant="text" sx={{ fontSize: '1rem', width: '60%' }} />
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Skeleton variant="rectangular" width="100%" height={36} />
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {isError && (
          <Alert severity="error" sx={{ mb: 4 }}>
            <Typography variant="body1">
              {error?.data?.message || "Failed to fetch blog posts. Please try again later."}
            </Typography>
            <Button onClick={refetch} sx={{ mt: 2 }}>
              Retry
            </Button>
          </Alert>
        )}

        {!isLoading && !isError && (
          <>
            {posts.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h5" sx={{ mb: 2 }}>
                  No blog posts found
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  {searchQuery ? "Try a different search term" : "Check back later for new posts"}
                </Typography>
              </Box>
            ) : (
              <>
                <Grid container spacing={4}>
                  {posts.map((post) => (
                    <Grid item xs={12} sm={6} md={4} key={post._id}>
                      <Card 
                        sx={{ 
                          height: '100%', 
                          display: 'flex', 
                          flexDirection: 'column',
                          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: 6
                          }
                        }}
                      >
                        {post.content?.image && (
                          <CardMedia
                            component="img"
                            height="200"
                            image={post.content.image}
                            alt={post.title}
                          />
                        )}
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Typography gutterBottom variant="h6" component="div" fontWeight="bold">
                              {post.title}
                            </Typography>
                            {post.category && (
                              <Chip 
                                label={post.category} 
                                color="primary" 
                                size="small" 
                              />
                            )}
                          </Box>
                          
                          {post.content?.excerpt && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              {post.content.excerpt}
                            </Typography>
                          )}
                          
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                            {post.category && (
                              <Chip 
                                icon={<Category />} 
                                label={post.category} 
                                size="small" 
                                variant="outlined" 
                              />
                            )}
                            <Chip 
                              icon={<CalendarToday />} 
                              label={formatDate(post.publishDate || post.createdAt)} 
                              size="small" 
                              variant="outlined" 
                            />
                            {post.tags && post.tags.length > 0 && (
                              <Chip 
                                label={`${post.tags.length} tags`} 
                                size="small" 
                                variant="outlined" 
                              />
                            )}
                          </Box>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Person fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                              Author
                            </Typography>
                          </Box>
                        </CardContent>
                        <CardActions sx={{ mt: 'auto', p: 2, pt: 0 }}>
                          <Button 
                            size="small" 
                            variant="contained" 
                            fullWidth
                            sx={{ 
                              fontWeight: 'bold',
                              borderRadius: 2,
                              py: 1
                            }}
                            href={post.route || `/blog/${post._id}`}
                          >
                            Read More
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>

                {totalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                    <Pagination 
                      count={totalPages} 
                      page={currentPage} 
                      onChange={handlePageChange} 
                      color="primary" 
                      size="large"
                    />
                  </Box>
                )}
              </>
            )}
          </>
        )}

        <Divider sx={{ my: 6 }} />

        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
            Never Miss a Story
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
            Subscribe to our newsletter and get the latest blog posts delivered to your inbox
          </Typography>
          <Button 
            variant="contained" 
            size="large"
            sx={{ 
              px: 4, 
              py: 1.5, 
              fontWeight: 'bold',
              borderRadius: 3,
              bgcolor: "primary.main",
              "&:hover": { bgcolor: "primary.dark" }
            }}
          >
            Subscribe to Newsletter
          </Button>
        </Box>

        <Box sx={{ mt: 4, p: 3, bgcolor: '#f0f8ff', borderRadius: 2 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            Write for Us
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Interested in contributing to the Nexus Mart Blog? We're always looking for passionate writers to share their expertise and insights.
          </Typography>
          <Typography variant="body1">
            For guest post inquiries, please contact our editorial team at 
            <Link href="mailto:blog@nexusmart.com"> blog@nexusmart.com</Link>.
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Blog;