require('dotenv').config();

const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const connectDB = require('./server/config/db.js');
const session = require('express-session');
const passport = require('passport');
const MongoStore = require('connect-mongo');
const methodOverride = require('method-override'); // Import method-override
const app = express();
const port = process.env.PORT || 5000;

// Connect to the database
connectDB();

// Middleware setup
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.use(expressLayouts);
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');

// Set up session middleware before passport initialization
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }) // Use MongoDB for session storage
}));

// Initialize Passport.js
app.use(passport.initialize());
app.use(passport.session());

// Use method-override
app.use(methodOverride('_method')); // Override with the X-HTTP-Method-Override header or a query parameter

// Route setup
app.use('/', require('./server/routes/auth'));
app.use('/', require('./server/routes/index'));
app.use('/', require('./server/routes/dashboard'));

app.get('/features', (req, res) => {
    res.render('features');
});

app.get('/creator', (req, res) => {
    res.render('creator'); // Ensure you have a creator.ejs file in the views directory
});

app.get('/reader', (req, res) => {
    res.render('reader'); // Ensure you have a creator.ejs file in the views directory
});
// 404 Error handling
app.get('*', function(req, res) {
    res.status(404).render('404');
});

// Start the server
app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
