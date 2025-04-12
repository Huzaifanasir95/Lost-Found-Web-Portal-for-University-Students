const express = require('express');
const router = express.Router();
const itemsController = require('../controllers/items.controller');
const { auth, admin } = require('../middleware/auth');
const ClaimLog = require('../models/ClaimLog');

// Get all pending claims
router.get('/claims', [auth, admin], itemsController.getPendingClaims);

// Approve or reject a claim
router.post('/claims/:id/:action', [auth, admin], async (req, res) => {
  try {
    const { id, action } = req.params;
    const { pickupLocation } = req.body;
    
    if (action !== 'approve' && action !== 'reject') {
      return res.status(400).json({ message: 'Invalid action' });
    }
    
    if (action === 'approve' && !pickupLocation) {
       return res.status(400).json({ message: 'Pickup location is required for approval' });
    }
    
    const status = action === 'approve' ? 'resolved' : 'rejected';
    
    // Pass necessary info to the controller via req object
    req.body.status = status;
    req.params.id = id;
    if (action === 'approve') {
        req.body.pickupLocation = pickupLocation;
    }
    
    // Call the existing controller function which now needs to handle pickupLocation
    const reviewResult = await itemsController.reviewItemClaim(req, res);
    
    // If reviewResult is null or undefined, the controller already sent a response
    if (!reviewResult) return;
    
    // After successful processing, create a log entry
    if (reviewResult && reviewResult.item && reviewResult.claim) {
      try {
        const logEntry = new ClaimLog({
          itemId: reviewResult.item._id,
          itemTitle: reviewResult.item.title,
          claimantId: reviewResult.claim.user,
          claimantName: reviewResult.claim.claimantName,
          adminId: req.user._id,
          adminName: req.user.name,
          action: action === 'approve' ? 'approved' : 'rejected',
        });
        await logEntry.save();
        console.log(`Claim log created for item ${reviewResult.item.title}`);
      } catch (logError) {
        console.error('Error creating claim log:', logError);
        // Continue execution even if logging fails
      }
    }
    
    // Send the item as response if not already sent by the controller
    res.json(reviewResult.item);
    
  } catch (error) {
    console.error(`Error ${req.params.action}ing claim:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get claim logs - new endpoint
router.get('/claim-logs', [auth, admin], async (req, res) => {
  try {
    const logs = await ClaimLog.find()
      .sort({ timestamp: -1 })
      .limit(100); // Limit to most recent 100 logs
    
    res.json(logs);
  } catch (error) {
    console.error('Error fetching claim logs:', error);
    res.status(500).json({ message: 'Server error fetching claim logs' });
  }
});

// Generate test logs for demonstration (remove in production)
router.post('/generate-test-logs', [auth, admin], async (req, res) => {
  try {
    const Item = require('../models/Item');
    const User = require('../models/User');
    
    // Get some real items and users for more realistic test data
    const items = await Item.find().limit(3);
    const admins = await User.find({ role: 'admin' }).limit(1);
    const users = await User.find().limit(3);
    
    if (items.length === 0 || users.length === 0) {
      return res.status(400).json({ message: 'Need items and users to generate test logs' });
    }
    
    const testLogs = [];
    
    // Create 5 test logs
    for (let i = 0; i < 5; i++) {
      const item = items[Math.floor(Math.random() * items.length)];
      const user = users[Math.floor(Math.random() * users.length)];
      const admin = admins.length > 0 ? admins[0] : { _id: req.user._id, name: req.user.name };
      const action = Math.random() > 0.5 ? 'approved' : 'rejected';
      
      const log = new ClaimLog({
        itemId: item._id,
        itemTitle: item.title,
        claimantId: user._id,
        claimantName: user.name,
        adminId: admin._id,
        adminName: admin.name,
        action: action,
        timestamp: new Date(Date.now() - Math.floor(Math.random() * 10000000))
      });
      
      await log.save();
      testLogs.push(log);
    }
    
    res.json({ message: 'Test logs generated successfully', count: testLogs.length });
  } catch (error) {
    console.error('Error generating test logs:', error);
    res.status(500).json({ message: 'Server error generating test logs' });
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
