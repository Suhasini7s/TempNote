const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middleware/checkAuth');
const dashboardController = require('../controllers/dashboardController');
const readercontrollder=require('../controllers/readerControllder');
/**
 * 
 * Dashboard Routes 
 */
router.get('/dashboard', isLoggedIn, dashboardController.dashboard);
router.get('/dashboard/add', isLoggedIn, dashboardController.dashboardAddNote); 
router.post('/dashboard/add', isLoggedIn, dashboardController.dashboardAddNoteSubmit);
router.get('/dashboard/note/:id', isLoggedIn, dashboardController.dashboardViewNote);
router.delete('/dashboard/note/:id', isLoggedIn, dashboardController.dashboardDeleteNote);
router.get('/dashboard/note/:id/edit', isLoggedIn, dashboardController.dashboardEditNote); 
router.put('/dashboard/note/:id', isLoggedIn, dashboardController.dashboardEditNoteSubmit);

// Route to display the form for entering the unique key and handle retrieval
router.get('/dashboard/retrieve', isLoggedIn, readercontrollder.retrieveNoteByKey);
router.get('/retrieve_note', isLoggedIn, readercontrollder.retrieveNotePage);


router.get('/dashboard/note/:id/convert', isLoggedIn, dashboardController.dashboardConvertNote);
router.delete('/dashboard/notes/delete-all', isLoggedIn, dashboardController.dashboardDeleteAllNotes);
router.get('/dashboard/note/view/:id', isLoggedIn, readercontrollder.viewNoteContent);


// Error handling middleware for catching errors
router.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("An unexpected error occurred.");
});
// Logout route
router.post('/logout', (req, res) => {
  req.logout((err) => {
      if (err) { return next(err); }
      res.redirect('/'); // Redirect to home page after logout
  });
});

module.exports = router;
