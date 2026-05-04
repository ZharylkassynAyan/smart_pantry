const mongoose = require('mongoose');

const pantryItemSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: String,
      required: true,
      trim: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    category: {
      type: String,
      default: 'Other',
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PantryItem', pantryItemSchema);
