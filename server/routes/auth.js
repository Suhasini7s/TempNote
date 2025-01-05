const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User'); // Ensure correct import
const router = express.Router();

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
    const role = profile._json.role || 'user'; // Default to 'user'

    const newUser = {
        googleId: profile.id,
        displayName: profile.displayName,
        firstName: profile.name.givenName || 'No First Name Provided',
        lastName: profile.name.familyName || 'No Last Name Provided',
        profileImage: profile.photos[0]?.value || '',
        role // Store the user's role
    };

    try {
        let user = await User.findOne({ googleId: profile.id });
        if (user) {
            return done(null, user);
        }

        // Additional validation before user creation
        if (!newUser.firstName || !newUser.lastName) {
            return done(new Error('First name and last name are required.'));
        }

        user = await User.create(newUser);
        done(null, user);
    } catch (error) {
        console.error('Error in Google Strategy:', error);
        return done(error);
    }
}));

// Auth Routes
router.get('/auth/google', (req, res, next) => {
    const role = req.query.role || 'user'; // Get role from query
    passport.authenticate('google', {
        scope: ['email', 'profile'],
        state: role // Pass role in the state parameter
    })(req, res, next);
});

router.get('/google/callback', passport.authenticate('google', {
    failureRedirect: '/login-failure'
}), (req, res) => {
    const role = req.query.state; // Retrieve the role from state
    if (role === 'creator') {
        res.redirect('/dashboard');
    } else {
        res.redirect('/retrieve_note');
    }
});

router.get('/login-failure', (req, res) => {
    res.send('Something Went Wrong...!');
});

router.get('/logout', (req, res) => {
    req.logout(err => {
        if (err) {
            console.error('Logout Error:', err);
            return res.send('Error Logging out');
        }
        res.redirect('/');
    });
});

// Serialize and Deserialize User
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        console.error('Error in Deserialization:', err);
        done(err, null);
    }
});

module.exports = router;
