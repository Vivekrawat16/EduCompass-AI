const mongoose = require('mongoose');

const ShortlistSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    universityId: {
        type: String, // Matching how we store it in Application/University
        required: true
    },
    universityName: String, // Embed for easier display
    country: String,

    category: {
        type: String,
        enum: ['Dream', 'Target', 'Safe'],
        default: 'Target'
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index to prevent duplicate shortlisting
ShortlistSchema.index({ user: 1, universityId: 1 }, { unique: true });

module.exports = mongoose.model('Shortlist', ShortlistSchema);
