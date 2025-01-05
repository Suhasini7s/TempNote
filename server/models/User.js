const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    googleId: {
        type: String,
        required: true
    },
    displayName: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true // Ensure this is marked as required
    },
    profileImage: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now // Automatically set created date
    },
    role: {
        type: String,
        enum: ['creator', 'reader', 'user'], // Roles allowed
        default: 'creator' 
    },
});

// Export the User model
module.exports = mongoose.model('User', UserSchema);
