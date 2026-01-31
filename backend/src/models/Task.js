const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: { type: String, required: true },
    description: String,
    status: {
        type: String,
        default: 'pending',
        enum: ['pending', 'in_progress', 'completed']
    },
    dueDate: Date,
    category: String, // 'Exam', 'Docs', etc.
    priority: { type: String, default: 'Medium' },

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Task', TaskSchema);
