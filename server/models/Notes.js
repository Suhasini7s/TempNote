const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const NoteSchema = new Schema({
    user: {
        type: Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    body: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    convertedUrl: {
        type: String,
    },
    uniqueKey: {  // Make this field optional
        type: String,
        unique: true,
    }
});

module.exports = mongoose.model('Notes', NoteSchema);
