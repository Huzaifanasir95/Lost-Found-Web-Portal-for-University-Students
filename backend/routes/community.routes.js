
const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const communityController = require('../controllers/community.controller');
const { auth } = require('../middleware/auth');

// @route   GET /api/community
// @desc    Get all posts with filtering
// @access  Public
router.get('/', communityController.getPosts);

// @route   GET /api/community/:id
// @desc    Get a single post by ID
// @access  Public
router.get('/:id', communityController.getPostById);

// @route   POST /api/community
// @desc    Create a new post
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('content', 'Content is required').not().isEmpty()
    ]
  ],
  communityController.createPost
);

// @route   PUT /api/community/:id
// @desc    Update a post
// @access  Private
router.put(
  '/:id',
  [
    auth,
    [
      check('title', 'Title is required').optional().not().isEmpty(),
      check('content', 'Content is required').optional().not().isEmpty()
    ]
  ],
  communityController.updatePost
);

// @route   DELETE /api/community/:id
// @desc    Delete a post
// @access  Private
router.delete('/:id', auth, communityController.deletePost);

// @route   POST /api/community/:id/like
// @desc    Like a post
// @access  Private
router.post('/:id/like', auth, communityController.likePost);

// @route   DELETE /api/community/:id/like
// @desc    Unlike a post
// @access  Private
router.delete('/:id/like', auth, communityController.unlikePost);

// @route   POST /api/community/:id/comments
// @desc    Add a comment to a post
// @access  Private
router.post(
  '/:id/comments',
  [
    auth,
    [
      check('text', 'Text is required').not().isEmpty()
    ]
  ],
  communityController.addComment
);

// @route   DELETE /api/community/:id/comments/:commentId
// @desc    Delete a comment
// @access  Private
router.delete('/:id/comments/:commentId', auth, communityController.deleteComment);

// @route   PUT /api/community/:id/resolve
// @desc    Mark post as resolved
// @access  Private
router.put('/:id/resolve', auth, communityController.markResolved);

module.exports = router;
