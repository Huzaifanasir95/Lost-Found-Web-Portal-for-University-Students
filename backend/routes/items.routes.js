
const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const itemsController = require('../controllers/items.controller');
const { auth, admin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// @route   GET /api/items
// @desc    Get all items with filtering
// @access  Public
router.get('/', itemsController.getItems);

// @route   GET /api/items/:id
// @desc    Get a single item by ID
// @access  Public
router.get('/:id', itemsController.getItemById);

// @route   POST /api/items
// @desc    Create a new item
// @access  Public (was Private)
router.post(
  '/',
  [
    upload.single('image'),
    [
      check('title', 'Title is required').not().isEmpty(),
      check('description', 'Description is required').not().isEmpty(),
      check('type', 'Type is required').isIn(['lost', 'found']),
      check('category', 'Category is required').not().isEmpty(),
      check('location', 'Location is required').not().isEmpty(),
      check('date', 'Date is required').not().isEmpty()
    ]
  ],
  itemsController.createItem
);

// @route   PUT /api/items/:id
// @desc    Update an item
// @access  Private
router.put(
  '/:id',
  [
    auth,
    upload.single('image')
  ],
  itemsController.updateItem
);

// @route   DELETE /api/items/:id
// @desc    Delete an item
// @access  Private
router.delete('/:id', auth, itemsController.deleteItem);

// @route   POST /api/items/:id/claim
// @desc    Claim an item
// @access  Private
router.post('/:id/claim', auth, itemsController.claimItem);

// @route   POST /api/items/:id/review
// @desc    Admin approve/reject item claim
// @access  Private (Admin only)
router.post(
  '/:id/review',
  [
    auth,
    admin,
    [
      check('status', 'Status must be either resolved or rejected').isIn(['resolved', 'rejected'])
    ]
  ],
  itemsController.reviewItemClaim
);

// @route   GET /api/items/claims/pending
// @desc    Get all pending claims for admin
// @access  Private (Admin only)
router.get('/claims/pending', [auth, admin], itemsController.getPendingClaims);

module.exports = router;
