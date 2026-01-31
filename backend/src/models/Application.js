const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    universityId: {
        type: String, // Can be internal ID or external string ID
        required: true
    },
    // We can embed basic university info here to avoid joins since University might be external
    universityName: String,
    country: String,
    ranking: Number,

    status: {
        type: String,
        default: 'Draft',
        enum: ['Draft', 'Applied', 'Accepted', 'Rejected', 'Waitlisted']
    },
    deadline: Date,
    notes: String,

    lockedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Application', ApplicationSchema);
