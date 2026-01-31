const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    full_name: { type: String, default: 'Student' },

    // Education & Readiness
    education: {
        level: String,     // e.g., 'Undergraduate'
        gpa: String,       // Stored as string to avoid precision issues
        major: String,
        target_major: String
    },

    // Preferences
    preferences: {
        target_country: String,
        budget: String    // e.g., '50000'
    },

    // Test Scores (Flexible)
    test_scores: {
        type: Map,
        of: String // e.g., { 'ielts': '7.5', 'sat': '1450' }
    },

    // Progress Tracking
    current_stage: {
        type: Number,
        default: 1
    },

    // Flattened fields for backward compatibility if needed, 
    // but better to structure them.
    // However, existing controllers access profile.target_country directly?
    // Let's keep it flat to match existing SQL usage where possible, 
    // OR update controllers to map correctly. 
    // SQL: profile.target_country.
    // Let's use flat fields at root to minimize controller rewrite friction.

    target_country: String,
    target_major: String,
    gpa: String,
    budget: String,

    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update timestamp on save
ProfileSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Profile', ProfileSchema);
