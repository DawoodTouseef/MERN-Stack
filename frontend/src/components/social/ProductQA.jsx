import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Stack,
  Grid,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Skeleton,
  Divider,
  Badge,
  Tooltip,
  Collapse,
} from '@mui/material';
import {
  ThumbUp,
  ThumbDown,
  Chat,
  QuestionAnswer,
  EmojiEvents,
  Verified,
  ExpandMore,
  ExpandLess,
  Flag,
  Follow,
  Notifications,
  Category,
  Search,
  Sort,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import {
  useGetProductQAQuery,
  useAskQuestionMutation,
  useAnswerQuestionMutation,
  useVoteOnQuestionMutation,
  useVoteOnAnswerMutation,
  useMarkBestAnswerMutation,
  useFollowQuestionMutation,
} from '../redux/api/productQAApiSlice';

const ProductQA = ({ product, userInfo }) => {
  const [sortBy, setSortBy] = useState('newest');
  const [filterBy, setFilterBy] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [askDialogOpen, setAskDialogOpen] = useState(false);
  const [answerDialogOpen, setAnswerDialogOpen] = useState(false);
  const [selectedQA, setSelectedQA] = useState(null);
  const [expandedAnswers, setExpandedAnswers] = useState({});
  
  // Question form state
  const [questionForm, setQuestionForm] = useState({
    text: '',
    category: 'general',
    tags: [],
    isAnonymous: false
  });
  
  // Answer form state
  const [answerForm, setAnswerForm] = useState({
    text: '',
    attachments: []
  });

  // API hooks
  const {
    data: qaData,
    isLoading: qaLoading,
    refetch: refetchQA,
  } = useGetProductQAQuery({
    productId: product._id,
    page: 1,
    limit: 10,
    sortBy,
    category: categoryFilter,
    hasAnswers: filterBy,
  });

  const [askQuestion, { isLoading: askingQuestion }] = useAskQuestionMutation();
  const [answerQuestion, { isLoading: answeringQuestion }] = useAnswerQuestionMutation();
  const [voteOnQuestion] = useVoteOnQuestionMutation();
  const [voteOnAnswer] = useVoteOnAnswerMutation();
  const [markBestAnswer] = useMarkBestAnswerMutation();
  const [followQuestion] = useFollowQuestionMutation();

  const categories = [
    { value: 'general', label: 'General' },
    { value: 'specifications', label: 'Specifications' },
    { value: 'compatibility', label: 'Compatibility' },
    { value: 'availability', label: 'Availability' },
    { value: 'shipping', label: 'Shipping' },
    { value: 'warranty', label: 'Warranty' },
    { value: 'pricing', label: 'Pricing' },
    { value: 'usage', label: 'Usage' },
    { value: 'installation', label: 'Installation' },
    { value: 'troubleshooting', label: 'Troubleshooting' }
  ];

  const handleAskQuestion = async () => {
    if (!userInfo) {
      alert('Please login to ask a question');
      return;
    }

    if (!questionForm.text.trim() || questionForm.text.length < 10) {
      alert('Question must be at least 10 characters long');
      return;
    }

    try {
      await askQuestion({
        productId: product._id,
        ...questionForm
      }).unwrap();
      
      setQuestionForm({ text: '', category: 'general', tags: [], isAnonymous: false });
      setAskDialogOpen(false);
      refetchQA();
      alert('Question posted successfully!');
    } catch (error) {
      console.error('Error asking question:', error);
      alert('Failed to post question. Please try again.');
    }
  };

  const handleAnswerQuestion = async () => {
    if (!userInfo) {
      alert('Please login to answer');
      return;
    }

    if (!answerForm.text.trim() || answerForm.text.length < 5) {
      alert('Answer must be at least 5 characters long');
      return;
    }

    try {
      await answerQuestion({
        qaId: selectedQA._id,
        ...answerForm
      }).unwrap();
      
      setAnswerForm({ text: '', attachments: [] });
      setAnswerDialogOpen(false);
      setSelectedQA(null);
      refetchQA();
      alert('Answer posted successfully!');
    } catch (error) {
      console.error('Error answering question:', error);
      alert('Failed to post answer. Please try again.');
    }
  };

  const handleVoteQuestion = async (qaId, isHelpful) => {
    if (!userInfo) {
      alert('Please login to vote');
      return;
    }

    try {
      await voteOnQuestion({ qaId, isHelpful }).unwrap();
      refetchQA();
    } catch (error) {
      console.error('Error voting on question:', error);
    }
  };

  const handleVoteAnswer = async (qaId, answerId, isHelpful) => {
    if (!userInfo) {
      alert('Please login to vote');
      return;
    }

    try {
      await voteOnAnswer({ qaId, answerId, isHelpful }).unwrap();
      refetchQA();
    } catch (error) {
      console.error('Error voting on answer:', error);
    }
  };

  const handleMarkBest = async (qaId, answerId) => {
    try {
      await markBestAnswer({ qaId, answerId }).unwrap();
      refetchQA();
      alert('Answer marked as best!');
    } catch (error) {
      console.error('Error marking best answer:', error);
      alert('Failed to mark best answer');
    }
  };

  const toggleAnswers = (qaId) => {
    setExpandedAnswers(prev => ({
      ...prev,
      [qaId]: !prev[qaId]
    }));
  };

  const getAnswerTypeColor = (answerType) => {
    switch (answerType) {
      case 'vendor': return '#4caf50';
      case 'admin': return '#f44336';
      case 'verified_buyer': return '#2196f3';
      default: return '#9e9e9e';
    }
  };

  const getAnswerTypeBadge = (answer) => {
    if (answer.isOfficialAnswer) {
      return (
        <Chip
          icon={<Verified />}
          label={answer.answerType === 'vendor' ? 'Official' : 'Admin'}
          size="small"
          sx={{ 
            bgcolor: getAnswerTypeColor(answer.answerType),
            color: 'white',
            fontWeight: 600
          }}
        />
      );
    }
    
    if (answer.isVerifiedPurchase) {
      return (
        <Chip
          icon={<Verified />}
          label="Verified Purchase"
          size="small"
          color="primary"
          variant="outlined"
        />
      );
    }
    
    return null;
  };

  if (qaLoading) {
    return (
      <Box>
        {[...Array(3)].map((_, index) => (
          <Skeleton key={index} variant="rectangular" height={200} sx={{ mb: 2, borderRadius: 2 }} />
        ))}
      </Box>
    );
  }

  return (
    <Box>
      {/* Header with Stats */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" fontWeight={700} color="primary.main">
            Questions & Answers
          </Typography>
          <Button
            variant="contained"
            startIcon={<QuestionAnswer />}
            onClick={() => setAskDialogOpen(true)}
            sx={{ borderRadius: 2 }}
          >
            Ask Question
          </Button>
        </Stack>
        
        {qaData?.filters?.stats && (
          <Grid container spacing={2}>
            <Grid item xs={6} md={3}>
              <Box textAlign="center">
                <Typography variant="h4" fontWeight={700} color="primary.main">
                  {qaData.filters.stats.totalQuestions}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Questions
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3}>
              <Box textAlign="center">
                <Typography variant="h4" fontWeight={700} color="success.main">
                  {qaData.filters.stats.totalAnswers}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Answers
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3}>
              <Box textAlign="center">
                <Typography variant="h4" fontWeight={700} color="warning.main">
                  {qaData.filters.stats.answerRate}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Answer Rate
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3}>
              <Box textAlign="center">
                <Typography variant="h4" fontWeight={700} color="info.main">
                  {qaData.filters.stats.questionsWithOfficialAnswers}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Official Answers
                </Typography>
              </Box>
            </Grid>
          </Grid>
        )}
      </Paper>

      {/* Filters and Sort */}
      <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Sort by</InputLabel>
            <Select
              value={sortBy}
              label="Sort by"
              onChange={(e) => setSortBy(e.target.value)}
            >
              <MenuItem value="newest">Newest</MenuItem>
              <MenuItem value="oldest">Oldest</MenuItem>
              <MenuItem value="most_helpful">Most Helpful</MenuItem>
              <MenuItem value="most_answers">Most Answers</MenuItem>
              <MenuItem value="popularity">Most Popular</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Filter</InputLabel>
            <Select
              value={filterBy}
              label="Filter"
              onChange={(e) => setFilterBy(e.target.value)}
            >
              <MenuItem value="all">All Questions</MenuItem>
              <MenuItem value="answered">Answered</MenuItem>
              <MenuItem value="unanswered">Unanswered</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={categoryFilter}
              label="Category"
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <MenuItem value="all">All Categories</MenuItem>
              {categories.map(cat => (
                <MenuItem key={cat.value} value={cat.value}>
                  {cat.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {/* Q&A List */}
      {qaData?.qas?.length > 0 ? (
        <Box>
          {qaData.qas.map((qa) => (
            <motion.div
              key={qa._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  mb: 3,
                  borderRadius: 3,
                  border: qa.hasOfficialAnswer ? '2px solid #4caf50' : '1px solid #e0e0e0'
                }}
              >
                {/* Question */}
                <Stack direction="row" spacing={2} mb={2}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                    Q
                  </Avatar>
                  
                  <Box flex={1}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
                      <Box>
                        <Typography variant="h6" fontWeight={600} mb={1}>
                          {qa.question.text}
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                          <Chip 
                            label={categories.find(c => c.value === qa.question.category)?.label || qa.question.category}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                          <Typography variant="body2" color="text.secondary">
                            by {qa.question.askedBy?.name || 'Anonymous'} • 
                            {formatDistanceToNow(new Date(qa.question.askedAt), { addSuffix: true })}
                          </Typography>
                          {qa.hasOfficialAnswer && (
                            <Chip
                              icon={<EmojiEvents />}
                              label="Has Official Answer"
                              size="small"
                              color="success"
                            />
                          )}
                        </Stack>
                      </Box>
                      
                      <Stack direction="row" spacing={1}>
                        <Button
                          size="small"
                          startIcon={<ThumbUp />}
                          onClick={() => handleVoteQuestion(qa._id, true)}
                          variant="outlined"
                          color="success"
                        >
                          {qa.questionHelpfulCount || 0}
                        </Button>
                        <Button
                          size="small"
                          startIcon={<ThumbDown />}
                          onClick={() => handleVoteQuestion(qa._id, false)}
                          variant="outlined"
                          color="error"
                        >
                          {qa.questionNotHelpfulCount || 0}
                        </Button>
                      </Stack>
                    </Stack>
                  </Box>
                </Stack>

                <Divider sx={{ my: 2 }} />

                {/* Answers */}
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {qa.totalAnswers} {qa.totalAnswers === 1 ? 'Answer' : 'Answers'}
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        startIcon={<Chat />}
                        onClick={() => {
                          setSelectedQA(qa);
                          setAnswerDialogOpen(true);
                        }}
                        variant="outlined"
                      >
                        Answer
                      </Button>
                      {qa.answers.length > 2 && (
                        <Button
                          size="small"
                          startIcon={expandedAnswers[qa._id] ? <ExpandLess /> : <ExpandMore />}
                          onClick={() => toggleAnswers(qa._id)}
                          variant="text"
                        >
                          {expandedAnswers[qa._id] ? 'Show Less' : `Show All ${qa.totalAnswers}`}
                        </Button>
                      )}
                    </Stack>
                  </Stack>

                  <Box>
                    {qa.answers
                      .slice(0, expandedAnswers[qa._id] ? qa.answers.length : 2)
                      .map((answer) => (
                        <Box
                          key={answer._id}
                          sx={{
                            mb: 2,
                            p: 2,
                            bgcolor: answer._id === qa.bestAnswer ? '#f3e5f5' : '#f9f9f9',
                            borderRadius: 2,
                            border: answer._id === qa.bestAnswer ? '2px solid #9c27b0' : '1px solid #e0e0e0'
                          }}
                        >
                          <Stack direction="row" spacing={2}>
                            <Avatar sx={{ bgcolor: getAnswerTypeColor(answer.answerType), width: 32, height: 32 }}>
                              A
                            </Avatar>
                            
                            <Box flex={1}>
                              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
                                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                  <Typography variant="body2" fontWeight={600}>
                                    {answer.answeredBy?.name}
                                  </Typography>
                                  {getAnswerTypeBadge(answer)}
                                  {answer._id === qa.bestAnswer && (
                                    <Chip
                                      icon={<EmojiEvents />}
                                      label="Best Answer"
                                      size="small"
                                      color="secondary"
                                    />
                                  )}
                                  <Typography variant="body2" color="text.secondary">
                                    {formatDistanceToNow(new Date(answer.answeredAt), { addSuffix: true })}
                                  </Typography>
                                </Stack>
                                
                                <Stack direction="row" spacing={1}>
                                  <Button
                                    size="small"
                                    startIcon={<ThumbUp />}
                                    onClick={() => handleVoteAnswer(qa._id, answer._id, true)}
                                    variant="outlined"
                                    color="success"
                                  >
                                    {answer.helpfulCount || 0}
                                  </Button>
                                  <Button
                                    size="small"
                                    startIcon={<ThumbDown />}
                                    onClick={() => handleVoteAnswer(qa._id, answer._id, false)}
                                    variant="outlined"
                                    color="error"
                                  >
                                    {answer.notHelpfulCount || 0}
                                  </Button>
                                  {userInfo && (qa.question.askedBy._id === userInfo._id || userInfo.role === 'admin') && answer._id !== qa.bestAnswer && (
                                    <Button
                                      size="small"
                                      startIcon={<EmojiEvents />}
                                      onClick={() => handleMarkBest(qa._id, answer._id)}
                                      variant="outlined"
                                      color="secondary"
                                    >
                                      Mark Best
                                    </Button>
                                  )}
                                </Stack>
                              </Stack>
                              
                              <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                                {answer.text}
                              </Typography>
                            </Box>
                          </Stack>
                        </Box>
                      ))}
                  </Box>
                </Box>
              </Paper>
            </motion.div>
          ))}
        </Box>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
          <Typography variant="h6" color="text.secondary" mb={1}>
            No questions yet
          </Typography>
          <Typography color="text.secondary" mb={2}>
            Be the first to ask a question about this product!
          </Typography>
          <Button
            variant="contained"
            startIcon={<QuestionAnswer />}
            onClick={() => setAskDialogOpen(true)}
          >
            Ask the First Question
          </Button>
        </Paper>
      )}

      {/* Ask Question Dialog */}
      <Dialog open={askDialogOpen} onClose={() => setAskDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Ask a Question</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={4}
            label="Your question"
            placeholder="What would you like to know about this product?"
            value={questionForm.text}
            onChange={(e) => setQuestionForm(prev => ({ ...prev, text: e.target.value }))}
            inputProps={{ maxLength: 500 }}
            helperText={`${questionForm.text.length}/500 characters (minimum 10)`}
            error={questionForm.text.length > 0 && questionForm.text.length < 10}
            sx={{ mt: 2, mb: 2 }}
          />
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={questionForm.category}
              label="Category"
              onChange={(e) => setQuestionForm(prev => ({ ...prev, category: e.target.value }))}
            >
              {categories.map(cat => (
                <MenuItem key={cat.value} value={cat.value}>
                  {cat.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAskDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleAskQuestion} 
            variant="contained"
            disabled={askingQuestion || questionForm.text.length < 10}
          >
            {askingQuestion ? 'Posting...' : 'Post Question'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Answer Question Dialog */}
      <Dialog open={answerDialogOpen} onClose={() => setAnswerDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Answer Question</DialogTitle>
        <DialogContent>
          {selectedQA && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2" fontWeight={600}>
                Question: {selectedQA.question.text}
              </Typography>
            </Alert>
          )}
          
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={4}
            label="Your answer"
            placeholder="Provide a helpful answer..."
            value={answerForm.text}
            onChange={(e) => setAnswerForm(prev => ({ ...prev, text: e.target.value }))}
            inputProps={{ maxLength: 1000 }}
            helperText={`${answerForm.text.length}/1000 characters (minimum 5)`}
            error={answerForm.text.length > 0 && answerForm.text.length < 5}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAnswerDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleAnswerQuestion} 
            variant="contained"
            disabled={answeringQuestion || answerForm.text.length < 5}
          >
            {answeringQuestion ? 'Posting...' : 'Post Answer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductQA;