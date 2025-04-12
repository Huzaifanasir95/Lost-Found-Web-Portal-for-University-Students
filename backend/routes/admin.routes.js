
const express = require('express');
const router = express.Router();
const itemsController = require('../controllers/items.controller');
const { auth, admin } = require('../middleware/auth');

// Get all pending claims
router.get('/claims', [auth, admin], itemsController.getPendingClaims);

// Approve or reject a claim
router.post('/claims/:id/:action', [auth, admin], async (req, res) => {
  try {
    const { id, action } = req.params;
    
    if (action !== 'approve' && action !== 'reject') {
      return res.status(400).json({ message: 'Invalid action' });
    }
    
    const status = action === 'approve' ? 'resolved' : 'rejected';
    
    // Use the existing review functionality
    req.body.status = status;
    req.params.id = id;
    
    await itemsController.reviewItemClaim(req, res);
  } catch (error) {
    console.error(`Error ${req.params.action}ing claim:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get admin dashboard stats
router.get('/stats', [auth, admin], async (req, res) => {
  try {
    const Item = require('../models/Item');
    
    const totalItems = await Item.countDocuments();
    const lostItems = await Item.countDocuments({ type: 'lost' });
    const foundItems = await Item.countDocuments({ type: 'found' });
    const resolvedItems = await Item.countDocuments({ status: 'resolved' });
    const highValueItems = await Item.countDocuments({ isHighValue: true });
    const claimsPending = await Item.countDocuments({ status: 'claimed' });
    const claimsResolved = await Item.countDocuments({ status: 'resolved' });
    
    res.json({
      totalItems,
      lostItems,
      foundItems,
      resolvedItems,
      highValueItems,
      claimsPending,
      claimsResolved
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get high value items
router.get('/high-value-items', [auth, admin], async (req, res) => {
  try {
    const Item = require('../models/Item');
    
    const items = await Item.find({ isHighValue: true })
      .sort({ createdAt: -1 })
      .select('_id title location createdAt type status isHighValue');
    
    // Format data for frontend
    const formattedItems = items.map(item => ({
      id: item._id,
      title: item.title,
      location: item.location,
      date: item.createdAt.toISOString().split('T')[0],
      status: item.type,
      isHighValue: item.isHighValue
    }));
    
    res.json(formattedItems);
  } catch (error) {
    console.error('Error fetching high value items:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
