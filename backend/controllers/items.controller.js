const Item = require('../models/Item');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Get all items with filtering
exports.getItems = async (req, res) => {
  try {
    const { type, category, status, search } = req.query;
    
    let query = {};
    
    if (type) query.type = type;
    if (category) query.category = category;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }
    
    console.log('Query:', query);
    
    const items = await Item.find(query)
      .populate('user', 'name email')
      .populate('claimedBy', 'name email')
      .sort({ createdAt: -1 });
      
    console.log(`Found ${items.length} items`);
    res.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a single item by ID
exports.getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('user', 'name email')
      .populate('claimedBy', 'name email');
      
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    res.json(item);
  } catch (error) {
    console.error('Error fetching item:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new item
exports.createItem = async (req, res) => {
  try {
    console.log('Create item request body:', req.body);
    console.log('Create item request file:', req.file);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { title, description, type, category, location, date, user, contactMethod } = req.body;
    
    // Create a new item instance
    const newItem = new Item({
      title,
      description,
      type,
      category,
      location,
      date,
      user: user || null,
      contactMethod: contactMethod || null,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
      status: 'pending'
    });
    
    console.log('Creating new item:', newItem);
    
    const item = await newItem.save();
    console.log('Item saved successfully:', item);
    
    res.status(201).json(item);
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update an item
exports.updateItem = async (req, res) => {
  try {
    let item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    // Check if user is authorized
    if (req.user && item.user && item.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const { title, description, category, location, date, status } = req.body;
    
    // Update fields
    if (title) item.title = title;
    if (description) item.description = description;
    if (category) item.category = category;
    if (location) item.location = location;
    if (date) item.date = date;
    if (status && req.user && req.user.role === 'admin') item.status = status;
    
    // Update image if provided
    if (req.file) {
      // Remove old image if exists
      if (item.imageUrl) {
        const oldImagePath = path.join(__dirname, '..', item.imageUrl);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      
      item.imageUrl = `/uploads/${req.file.filename}`;
    }
    
    await item.save();
    
    res.json(item);
  } catch (error) {
    console.error('Error updating item:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete an item
exports.deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    // Check if user is authorized
    if (req.user && item.user && item.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Remove image if exists
    if (item.imageUrl) {
      const imagePath = path.join(__dirname, '..', item.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await Item.deleteOne({ _id: item._id });
    
    res.json({ message: 'Item removed' });
  } catch (error) {
    console.error('Error deleting item:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Claim an item
exports.claimItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    // Can't claim own item
    if (req.user && item.user && item.user.toString() === req.user.id) {
      return res.status(400).json({ message: 'Cannot claim your own item' });
    }
    
    // Check if item is already claimed or resolved
    if (item.status !== 'pending') {
      return res.status(400).json({ 
        message: `Item is already ${item.status}` 
      });
    }
    
    // Get claim details from request
    const { description, contactInfo, proofDetails } = req.body;
    
    // Update item status and claim details
    item.status = 'claimed';
    item.claimedBy = req.user ? req.user.id : null;
    item.claim = {
      description,
      contactInfo,
      proofDetails,
      date: new Date()
    };
    
    await item.save();
    
    // Create notification for item owner
    if (item.user) {
      const notification = new Notification({
        user: item.user,
        message: `Someone has claimed your ${item.type} item: ${item.title}`,
        relatedItem: item._id
      });
      
      await notification.save();
    }
    
    // Create notification for admin
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      const adminNotification = new Notification({
        user: admin._id,
        message: `New claim requires review: ${item.title}`,
        relatedItem: item._id
      });
      
      await adminNotification.save();
    }
    
    res.json(item);
  } catch (error) {
    console.error('Error claiming item:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Get pending claims for admin
exports.getPendingClaims = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const items = await Item.find({ status: 'claimed' })
      .populate('user', 'name email')
      .populate('claimedBy', 'name email')
      .sort({ 'claim.date': -1 });
      
    // Transform to a more suitable format for the frontend
    const claims = items.map(item => ({
      id: item._id,
      itemId: item._id,
      itemName: item.title,
      claimantName: item.claimedBy ? item.claimedBy.name : 'Anonymous',
      claimantEmail: item.claimedBy ? item.claimedBy.email : 'N/A',
      dateSubmitted: item.claim ? item.claim.date.toISOString().split('T')[0] : 'Unknown',
      status: item.status,
      description: item.claim ? item.claim.description : '',
      contactInfo: item.claim ? item.claim.contactInfo : '',
      proofDetails: item.claim ? item.claim.proofDetails : '',
      itemType: item.type
    }));
    
    res.json(claims);
    
  } catch (error) {
    console.error('Error fetching pending claims:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin review item claim (approve/reject)
exports.reviewItemClaim = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const { status } = req.body;
    
    if (!status || (status !== 'resolved' && status !== 'rejected')) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    // Check if item is claimed
    if (item.status !== 'claimed') {
      return res.status(400).json({ message: 'Item is not claimed' });
    }
    
    // Update item status
    item.status = status;
    
    await item.save();
    
    // Create notifications
    const ownerMessage = status === 'resolved' 
      ? `Your ${item.type} item has been successfully returned to its ${item.type === 'lost' ? 'owner' : 'finder'}`
      : `The claim for your ${item.type} item has been rejected`;
    
    const claimerMessage = status === 'resolved'
      ? `Your claim for the ${item.type} item has been approved`
      : `Your claim for the ${item.type} item has been rejected`;
    
    // Notification for item owner
    if (item.user) {
      const ownerNotification = new Notification({
        user: item.user,
        message: ownerMessage,
        relatedItem: item._id
      });
      
      await ownerNotification.save();
    }
    
    // Notification for claimer
    if (item.claimedBy) {
      const claimerNotification = new Notification({
        user: item.claimedBy,
        message: claimerMessage,
        relatedItem: item._id
      });
      
      await claimerNotification.save();
    }
    
    res.json(item);
  } catch (error) {
    console.error('Error reviewing item claim:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};
