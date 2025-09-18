import express from 'express';
import {
  getProductQA,
  askQuestion,
  answerQuestion,
  voteOnQuestion,
  voteOnAnswer,
  markBestAnswer,
  followQuestion
} from '../controllers/productQAController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { searchLimiter } from '../middlewares/rateLimitMiddleware.js';

const router = express.Router();

// Public routes
router.get('/:productId/qa', searchLimiter, getProductQA);

// Protected routes (require authentication)
router.use(authenticate);

// Question management
router.post('/:productId/qa/ask', askQuestion);
router.post('/qa/:qaId/answer', answerQuestion);

// Voting system
router.post('/qa/:qaId/vote-question', voteOnQuestion);
router.post('/qa/:qaId/answers/:answerId/vote', voteOnAnswer);

// Best answer management
router.put('/qa/:qaId/best-answer/:answerId', markBestAnswer);

// Follow system
router.post('/qa/:qaId/follow', followQuestion);
router.delete('/qa/:qaId/follow', followQuestion); // Same handler, but removes follow

export default router;