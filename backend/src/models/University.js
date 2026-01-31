const mongoose = require('mongoose');

const UniversitySchema = new mongoose.Schema({
    // Custom ID if we want to string IDs, or let Mongo use _id
    // But existing data might use string IDs. 
    // Let's use a flexible id field if needed, or just standard Mongo _id.
    // Given the ID fix (VARCHAR), let's allow a custom `sourceId` for external referencing.
    sourceId: { type: String, unique: true, sparse: true },

    name: { type: String, required: true },
    country: String,
    ranking: Number,
    tuition_fee: String,
    details: mongoose.Schema.Types.Mixed // Flexible JSON
});

module.exports = mongoose.model('University', UniversitySchema);
