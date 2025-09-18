import asyncHandler from '../middlewares/asyncHandler.js';
import mongoose from 'mongoose';
import ProductQA from '../models/productQAModel.js';
import Product from '../models/productModel.js';
import User from '../models/userModel.js';
import Order from '../models/orderModel.js';

// @desc    Get Q&A for a product
// @route   GET /api/products/:productId/qa
// @access  Public
const getProductQA = asyncHandler(async (req, res) => {
  try {
    const { productId } = req.params;
    const { 
      page = 1, 
      limit = 10, 
      sortBy = 'newest',
      category = 'all',
      hasAnswers = 'all',
      search = ''
    } = req.query;

    // Build query
    let query = { product: productId };
    
    // Category filter
    if (category !== 'all') {
      query['question.category'] = category;
    }
    
    // Has answers filter
    if (hasAnswers === 'answered') {
      query.totalAnswers = { $gt: 0 };
    } else if (hasAnswers === 'unanswered') {
      query.totalAnswers = 0;
    }
    
    // Search filter
    if (search) {
      query.$text = { $search: search };
    }

    // Build sort options
    let sortOptions = {};
    switch (sortBy) {
      case 'newest':
        sortOptions = { 'question.askedAt': -1 };
        break;
      case 'oldest':
        sortOptions = { 'question.askedAt': 1 };
        break;
      case 'most_helpful':
        sortOptions = { questionHelpfulCount: -1, 'question.askedAt': -1 };
        break;
      case 'most_answers':
        sortOptions = { totalAnswers: -1, 'question.askedAt': -1 };
        break;
      case 'popularity':
        sortOptions = { 'analytics.popularityScore': -1 };
        break;
      default:
        sortOptions = { 'question.askedAt': -1 };
    }

    const pageSize = parseInt(limit);
    const skip = (parseInt(page) - 1) * pageSize;

    const qas = await ProductQA.find(query)
      .populate('question.askedBy', 'name role')
      .populate('answers.answeredBy', 'name role')
      .populate('bestAnswer')
      .sort(sortOptions)
      .skip(skip)
      .limit(pageSize);

    const totalQAs = await ProductQA.countDocuments(query);
    const totalPages = Math.ceil(totalQAs / pageSize);

    res.json({
      success: true,
      qas,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalQAs,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      },
      filters: {
        categories: await getQACategories(productId),
        stats: await getQAStats(productId)
      }
    });
  } catch (error) {
    console.error('Get product Q&A error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get product Q&A',
      message: error.message 
    });
  }
});

// @desc    Ask a question about a product
// @route   POST /api/products/:productId/qa/ask
// @access  Private
const askQuestion = asyncHandler(async (req, res) => {
  try {
    const { productId } = req.params;
    const { text, category, tags, isAnonymous } = req.body;

    // Validate input
    if (!text || text.trim().length < 10) {
      return res.status(400).json({ error: 'Question must be at least 10 characters long' });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check for duplicate questions (similar text)
    const existingQuestion = await ProductQA.findOne({
      product: productId,
      'question.text': { $regex: text.trim(), $options: 'i' }
    });

    if (existingQuestion) {
      return res.status(400).json({ 
        error: 'A similar question already exists',
        existingQA: existingQuestion._id
      });
    }

    // Create new Q&A
    const newQA = new ProductQA({
      product: productId,
      question: {
        text: text.trim(),
        askedBy: req.user._id,
        category: category || 'general',
        tags: tags || [],
        isAnonymous: isAnonymous || false
      }
    });

    await newQA.save();
    
    // Populate the response
    const populatedQA = await ProductQA.findById(newQA._id)
      .populate('question.askedBy', 'name role');

    res.status(201).json({
      success: true,
      message: 'Question posted successfully',
      qa: populatedQA
    });
  } catch (error) {
    console.error('Ask question error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to post question',
      message: error.message 
    });
  }
});

// @desc    Answer a question
// @route   POST /api/products/qa/:qaId/answer
// @access  Private
const answerQuestion = asyncHandler(async (req, res) => {
  try {
    const { qaId } = req.params;
    const { text, attachments } = req.body;

    // Validate input
    if (!text || text.trim().length < 5) {
      return res.status(400).json({ error: 'Answer must be at least 5 characters long' });
    }

    const qa = await ProductQA.findById(qaId);
    if (!qa) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // Check if user has purchased the product (for verified purchase badge)
    const userOrders = await Order.find({
      user: req.user._id,
      'orderItems.product': qa.product,
      orderStatus: { $in: ['Processing', 'Shipped', 'Delivered'] }
    });

    const isVerifiedPurchase = userOrders.length > 0;

    // Determine answer type
    let answerType = 'customer';
    if (req.user.role === 'admin') {
      answerType = 'admin';
    } else if (req.user.role === 'vendor' || req.user.role === 'seller') {
      // Check if user is the vendor/seller of this product
      const product = await Product.findById(qa.product).populate('vendor');
      if (product.vendor && product.vendor._id.toString() === req.user._id.toString()) {
        answerType = 'vendor';
      }
    } else if (isVerifiedPurchase) {
      answerType = 'verified_buyer';
    }

    // Create answer
    const newAnswer = {
      text: text.trim(),
      answeredBy: req.user._id,
      answerType,
      isVerifiedPurchase,
      isOfficialAnswer: answerType === 'vendor' || answerType === 'admin',
      attachments: attachments || []
    };

    qa.answers.push(newAnswer);
    await qa.save();

    // Get the populated Q&A
    const updatedQA = await ProductQA.findById(qaId)
      .populate('question.askedBy', 'name role')
      .populate('answers.answeredBy', 'name role');

    res.json({
      success: true,
      message: 'Answer posted successfully',
      qa: updatedQA,
      newAnswer: updatedQA.answers[updatedQA.answers.length - 1]
    });
  } catch (error) {
    console.error('Answer question error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to post answer',
      message: error.message 
    });
  }
});

// @desc    Vote on a question
// @route   POST /api/products/qa/:qaId/vote-question
// @access  Private
const voteOnQuestion = asyncHandler(async (req, res) => {
  try {
    const { qaId } = req.params;
    const { isHelpful } = req.body;

    const qa = await ProductQA.findById(qaId);
    if (!qa) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // Check if user already voted
    const existingVoteIndex = qa.questionVotes.findIndex(
      vote => vote.user.toString() === req.user._id.toString()
    );

    if (existingVoteIndex !== -1) {
      // Update existing vote
      const existingVote = qa.questionVotes[existingVoteIndex];
      if (existingVote.isHelpful !== isHelpful) {
        // Update counts
        if (existingVote.isHelpful) {
          qa.questionHelpfulCount -= 1;
          qa.questionNotHelpfulCount += 1;
        } else {
          qa.questionNotHelpfulCount -= 1;
          qa.questionHelpfulCount += 1;
        }
        existingVote.isHelpful = isHelpful;
        existingVote.votedAt = new Date();
      }
    } else {
      // Add new vote
      qa.questionVotes.push({
        user: req.user._id,
        isHelpful,
        votedAt: new Date()
      });
      
      if (isHelpful) {
        qa.questionHelpfulCount += 1;
      } else {
        qa.questionNotHelpfulCount += 1;
      }
    }

    await qa.save();

    res.json({
      success: true,
      message: 'Vote recorded successfully',
      helpfulCount: qa.questionHelpfulCount,
      notHelpfulCount: qa.questionNotHelpfulCount
    });
  } catch (error) {
    console.error('Vote on question error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to record vote',
      message: error.message 
    });
  }
});

// @desc    Vote on an answer
// @route   POST /api/products/qa/:qaId/answers/:answerId/vote
// @access  Private
const voteOnAnswer = asyncHandler(async (req, res) => {
  try {
    const { qaId, answerId } = req.params;
    const { isHelpful } = req.body;

    const qa = await ProductQA.findById(qaId);
    if (!qa) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const answer = qa.answers.id(answerId);
    if (!answer) {
      return res.status(404).json({ error: 'Answer not found' });
    }

    // Check if user already voted on this answer
    const existingVoteIndex = answer.votes.findIndex(
      vote => vote.user.toString() === req.user._id.toString()
    );

    if (existingVoteIndex !== -1) {
      // Update existing vote
      const existingVote = answer.votes[existingVoteIndex];
      if (existingVote.isHelpful !== isHelpful) {
        // Update counts
        if (existingVote.isHelpful) {
          answer.helpfulCount -= 1;
          answer.notHelpfulCount += 1;
        } else {
          answer.notHelpfulCount -= 1;
          answer.helpfulCount += 1;
        }
        existingVote.isHelpful = isHelpful;
        existingVote.votedAt = new Date();
      }
    } else {
      // Add new vote
      answer.votes.push({
        user: req.user._id,
        isHelpful,
        votedAt: new Date()
      });
      
      if (isHelpful) {
        answer.helpfulCount += 1;
      } else {
        answer.notHelpfulCount += 1;
      }
    }

    await qa.save();

    res.json({
      success: true,
      message: 'Vote recorded successfully',
      helpfulCount: answer.helpfulCount,
      notHelpfulCount: answer.notHelpfulCount
    });
  } catch (error) {
    console.error('Vote on answer error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to record vote',
      message: error.message 
    });
  }
});

// @desc    Mark answer as best answer
// @route   PUT /api/products/qa/:qaId/best-answer/:answerId
// @access  Private (Question asker or admin)
const markBestAnswer = asyncHandler(async (req, res) => {
  try {
    const { qaId, answerId } = req.params;

    const qa = await ProductQA.findById(qaId);
    if (!qa) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // Check if user has permission (question asker or admin)
    if (qa.question.askedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to mark best answer' });
    }

    const answer = qa.answers.id(answerId);
    if (!answer) {
      return res.status(404).json({ error: 'Answer not found' });
    }

    qa.bestAnswer = answerId;
    await qa.save();

    res.json({
      success: true,
      message: 'Best answer marked successfully',
      bestAnswerId: answerId
    });
  } catch (error) {
    console.error('Mark best answer error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to mark best answer',
      message: error.message 
    });
  }
});

// @desc    Follow a question for notifications
// @route   POST /api/products/qa/:qaId/follow
// @access  Private
const followQuestion = asyncHandler(async (req, res) => {
  try {
    const { qaId } = req.params;
    const { notificationPreferences } = req.body;

    const qa = await ProductQA.findById(qaId);
    if (!qa) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // Check if user is already following
    const existingFollowerIndex = qa.followers.findIndex(
      follower => follower.user.toString() === req.user._id.toString()
    );

    if (existingFollowerIndex !== -1) {
      // Update existing follow preferences
      qa.followers[existingFollowerIndex].notificationPreferences = {
        ...qa.followers[existingFollowerIndex].notificationPreferences,
        ...notificationPreferences
      };
    } else {
      // Add new follower
      qa.followers.push({
        user: req.user._id,
        notificationPreferences: notificationPreferences || {
          newAnswers: true,
          bestAnswer: true
        }
      });
    }

    await qa.save();

    res.json({
      success: true,
      message: 'Question followed successfully',
      followersCount: qa.followers.length
    });
  } catch (error) {
    console.error('Follow question error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to follow question',
      message: error.message 
    });
  }
});

// Helper function to get Q&A categories with counts
const getQACategories = async (productId) => {
  try {
    const categories = await ProductQA.aggregate([
      { $match: { product: mongoose.Types.ObjectId(productId) } },
      {
        $group: {
          _id: '$question.category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    return categories.map(cat => ({
      category: cat._id,
      count: cat.count
    }));
  } catch (error) {
    console.error('Error getting Q&A categories:', error);
    return [];
  }
};

// Helper function to get Q&A statistics
const getQAStats = async (productId) => {
  try {
    const stats = await ProductQA.aggregate([
      { $match: { product: mongoose.Types.ObjectId(productId) } },
      {
        $group: {
          _id: null,
          totalQuestions: { $sum: 1 },
          totalAnswers: { $sum: '$totalAnswers' },
          answeredQuestions: {
            $sum: { $cond: [{ $gt: ['$totalAnswers', 0] }, 1, 0] }
          },
          questionsWithOfficialAnswers: {
            $sum: { $cond: ['$hasOfficialAnswer', 1, 0] }
          }
        }
      }
    ]);

    if (stats.length === 0) {
      return {
        totalQuestions: 0,
        totalAnswers: 0,
        answeredQuestions: 0,
        questionsWithOfficialAnswers: 0,
        answerRate: 0
      };
    }

    const result = stats[0];
    return {
      ...result,
      answerRate: result.totalQuestions > 0 
        ? Math.round((result.answeredQuestions / result.totalQuestions) * 100) 
        : 0
    };
  } catch (error) {
    console.error('Error getting Q&A stats:', error);
    return {
      totalQuestions: 0,
      totalAnswers: 0,
      answeredQuestions: 0,
      questionsWithOfficialAnswers: 0,
      answerRate: 0
    };
  }
};

export {
  getProductQA,
  askQuestion,
  answerQuestion,
  voteOnQuestion,
  voteOnAnswer,
  markBestAnswer,
  followQuestion
};