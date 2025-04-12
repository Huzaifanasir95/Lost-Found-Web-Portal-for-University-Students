const mongoose = require('mongoose');

const ClaimLogSchema = new mongoose.Schema({
  itemId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Item', 
    required: true 
  },
  itemTitle: { 
    type: String, 
    required: true 
  },
  claimantId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'
  },
  claimantName: { 
    type: String 
  },
  adminId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  adminName: { 
    type: String, 
    required: true 
  },
  action: { 
    type: String, 
    enum: ['approved', 'rejected'], 
    required: true 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

module.exports = mongoose.model('ClaimLog', ClaimLogSchema); 