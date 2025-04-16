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
    
    const { title, description, type, category, location, date, contactMethod, isAnonymous } = req.body;
    
    // Create a new item instance
    const newItem = new Item({
      title,
      description,
      type,
      category,
      location,
      date,
      user: req.user ? req.user.id : null,
      contactMethod: contactMethod || null,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
      status: 'pending',
      isAnonymous: isAnonymous || false
    });
    
    console.log('Creating new item:', newItem);
    
    const item = await newItem.save();
    
    // Populate the user information before sending response
    await item.populate('user', 'name email');
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
    const item = await Item.findById(req.params.id)
      .populate('user', 'name email');
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    // Check if the user is trying to claim their own reported item
    if (item.user && item.user._id.toString() === req.user.id) {
      return res.status(403).json({ 
        message: 'You cannot claim an item that you reported' 
      });
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
        user: item.user._id,
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
    
    // Populate the user information before sending response
    await item.populate('claimedBy', 'name email');
    
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
    
    // Extract status and pickupLocation from body
    const { status, pickupLocation } = req.body;
    
    if (!status || (status !== 'resolved' && status !== 'rejected')) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Validate pickupLocation only if resolving
    if (status === 'resolved' && !pickupLocation) {
       return res.status(400).json({ message: 'Pickup location is required for approval' });
    }
    
    // Find item first
    let item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    // Populate necessary fields (safer approach for linters)
    item = await item.populate([ 
        { path: 'claimedBy', select: 'name email' }, 
        { path: 'user', select: 'name email' } 
    ]);
    
    // Check if item is claimed
    if (item.status !== 'claimed') {
      return res.status(400).json({ message: 'Item is not in a \'claimed\' state' });
    }
    
    const originalClaimer = item.claimedBy; // Store original claimer object for notification
    const itemOwner = item.user; // Store item owner object for notification
    
    // Store claim information for logging
    const claimInfo = {
      user: originalClaimer ? originalClaimer._id : null,
      claimantName: originalClaimer ? originalClaimer.name : 'Anonymous',
      itemId: item._id,
      itemTitle: item.title,
      action: status === 'resolved' ? 'approved' : 'rejected'
    };
    
    // Update item status and potentially clear claim details
    if (status === 'resolved') {
      item.status = 'resolved';
      // We might want to store the pickup location on the item itself if needed later?
      // item.pickupLocation = pickupLocation; // Example if needed
    } else { // status === 'rejected'
      item.status = 'pending'; // Set back to pending to allow new claims
      item.claimedBy = null;    // Clear the user who claimed it
      item.claim = undefined; // Clear the claim details
    }
    
    await item.save();
    
    // --- Create notifications with pickup location details ---
    let ownerMessage = `Update on your ${item.type} item '${item.title}'.`; // Default message
    let claimerMessage = `Update on your claim for the ${item.type} item '${item.title}'.`; // Default message

    if (status === 'resolved') {
      // Use itemOwner and originalClaimer directly for user IDs
      ownerMessage = `Good news! Your ${item.type} item '${item.title}' has been claimed and approved. Please arrange pickup/drop-off at: ${pickupLocation}. Contact the claimant (${originalClaimer?.name || 'N/A'} - ${originalClaimer?.email || 'N/A'}) if needed.`;
      claimerMessage = `Your claim for the ${item.type} item '${item.title}' has been approved! Please coordinate the pickup/drop-off at the designated location: ${pickupLocation}. Contact the owner (${itemOwner?.name || 'Reporter'} - ${itemOwner?.email || 'N/A'}) if needed.`;
    } else { // status === 'rejected'
      ownerMessage = `The claim for your ${item.type} item '${item.title}' was rejected. The item is now available again.`;
      claimerMessage = `Unfortunately, your claim for the ${item.type} item '${item.title}' has been rejected by the admin.`;
    }
    
    // Notification for item owner (if they exist)
    if (itemOwner) {
      const ownerNotification = new Notification({
        user: itemOwner._id,
        message: ownerMessage,
        relatedItem: item._id
      });
      await ownerNotification.save();
    }
    
    // Notification for the original claimer (if they exist)
    if (originalClaimer) {
      const claimerNotification = new Notification({
        user: originalClaimer._id, // Use the stored ID
        message: claimerMessage,
        relatedItem: item._id
      });
      await claimerNotification.save();
    }
    
    // Return both item and claim info for logging purposes in the admin route
    return {
      item: item,
      claim: claimInfo,
      success: true
    };
  } catch (error) {
    console.error('Error reviewing item claim:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.status(500).json({ message: 'Server error' });
    return null;
  }
};

// Add comment to an item
exports.addCommentToItem = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const newComment = {
      text: req.body.text,
      user: req.user.id // Assuming auth middleware adds user to req
      // createdAt defaults via schema
    };

    item.comments.push(newComment);
    await item.save();

    // Populate user details for the newly added comment before sending response
    await Item.populate(item, { path: 'comments.user', select: 'name email' });
    
    // Return only the newly added comment or the whole comments array?
    // Returning the full updated comments array is often useful for frontend state update.
    res.status(201).json(item.comments);

  } catch (error) {
    console.error('Error adding comment to item:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Cancel a claim made by the current user
exports.cancelClaim = async (req, res) => {
  const itemId = req.params.id;
  const userId = req.user.id;
  console.log(`Attempting to cancel claim for item ${itemId} by user ${userId}`);

  try {
    console.log('Finding item...');
    const item = await Item.findById(itemId);

    if (!item) {
      console.log('Item not found');
      return res.status(404).json({ message: 'Item not found' });
    }
    console.log('Item found:', item.status, item.claimedBy);

    // Check if the item is actually claimed
    if (item.status !== 'claimed') {
       console.log('Item not in claimed state');
      return res.status(400).json({ message: 'Item is not currently claimed' });
    }

    // Check if the current user is the one who claimed it
    if (!item.claimedBy || item.claimedBy.toString() !== userId) {
       console.log(`Authorization failed: Item claimed by ${item.claimedBy}, user is ${userId}`);
      return res.status(403).json({ message: 'Not authorized to cancel this claim' });
    }
    console.log('User authorized.');

    // Reset claim status
    console.log('Resetting item status to available and clearing claimedBy');
    item.status = 'available'; // Make it available again for others to claim
    const previousClaimerId = item.claimedBy;
    item.claimedBy = null;
    // item.claim = undefined; // Assuming claim details are not directly on item or handled elsewhere

    console.log('Saving item...');
    await item.save();
    console.log('Item saved successfully.');

    // Optional: Notify item owner that the claim was cancelled
    if (item.user && item.user.toString() !== previousClaimerId.toString()) { // Don't notify if owner cancelled their own claim (edge case?)
        console.log(`Attempting to notify owner ${item.user}`);
        try {
             await Notification.create({
                user: item.user,
                message: `The claim on your ${item.type} item '${item.title}' has been cancelled by the claimant.`,
                relatedItem: item._id
            });
             console.log(`Notification sent to owner ${item.user}`);
        } catch (notifError) {
             console.error("Error creating cancellation notification:", notifError);
             // Don't fail the whole request if notification fails
        }
    } else {
        console.log('No owner notification needed or owner is the claimant.');
    }

    console.log('Claim cancelled successfully.');
    res.json({ message: 'Claim cancelled successfully', item });

  } catch (error) {
    console.error('Error during cancelClaim process:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Item not found' });
    }
    // Adding more specific error logging
    res.status(500).json({ message: 'Server error canceling claim', error: error.message });
  }
};
