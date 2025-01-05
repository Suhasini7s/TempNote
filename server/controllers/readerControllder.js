const Note = require("../models/Notes");
const mongoose = require("mongoose");
const { body, validationResult } = require('express-validator');

const baseUrl = process.env.BASE_URL || 'http://localhost:5000';

/**
 * GET /dashboard
 * Dashboard
 */
exports.dashboard = async (req, res) => {
  const perPage = 12;
  const page = parseInt(req.query.page, 10) || 1;

  const locals = {
    title: "Dashboard",
    description: "Free NodeJS Notes App.",
  };

  try {
    if (!req.user || !mongoose.Types.ObjectId.isValid(req.user.id)) {
      return res.status(400).send("Invalid user ID.");
    }

    const userId = new mongoose.Types.ObjectId(req.user.id);
    const notes = await Note.aggregate([
      { $match: { user: userId } },
      { $sort: { updatedAt: -1 } },
      {
        $project: {
          title: { $substr: ["$title", 0, 30] },
          body: { $substr: ["$body", 0, 100] },
          _id: 1,
        },
      },
    ])
      .skip(perPage * (page - 1))
      .limit(perPage)
      .exec();

    const count = await Note.countDocuments({ user: userId });

    const notesWithLinks = notes.map(note => ({
      ...note,
      url: `/dashboard/note/view/${note._id}`,
    }));

    res.render('dashboard/Creator/index', {
      userName: req.user.firstName,
      locals,
      notes: notesWithLinks,
      layout: "../views/layouts/dashboard",
      current: page,
      pages: Math.ceil(count / perPage),
    });
  } catch (error) {
    console.error("Error fetching dashboard:", error);
    res.status(500).send("An error occurred while fetching the dashboard.");
  }
};

/**
 * GET /dashboard/add
 * Add Notes Form
 */
exports.dashboardAddNote = async (req, res) => {
  res.render("dashboard/Creator/add", {
    layout: "../views/layouts/dashboard",
  });
};

/**
 * POST /dashboard/add
 * Add Notes
 */
exports.dashboardAddNoteSubmit = async (req, res) => {
  try {
    req.body.user = req.user.id; // Set user ID

    // Generate a unique key
    req.body.uniqueKey = generateUniqueKey();

    const newNote = await Note.create(req.body);

    // Generate the converted URL after note creation
    const convertedUrl = `${baseUrl}/dashboard/note/view/${newNote._id}`;
    newNote.convertedUrl = convertedUrl;

    await newNote.save(); // Save the note with the URL

    res.redirect("/dashboard");
  } catch (error) {
    console.error("Error adding note:", error);
    res.status(500).send("An error occurred while adding the note. Details: " + error.message);
  }
};

/**
 * GET /dashboard/note/:id
 * View Specific Note
 */
exports.dashboardViewNote = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user.id }).lean();
    if (!note) {
      return res.status(404).send("Note not found.");
    }
    res.render("dashboard/Creator/view-note", {
      noteID: req.params.id,
      note,
      layout: "../views/layouts/dashboard",
    });
  } catch (error) {
    console.error("Error viewing note:", error);
    res.status(500).send("An error occurred while viewing the note.");
  }
};

/**
 * GET /dashboard/note/:id/edit
 * Render Edit Note Form
 */
exports.dashboardEditNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).send("Note not found.");
    }

    res.render('dashboard/Creator/update', {
      errors: [],
      noteID: req.params.id,
      note, // Pass the fetched note object
      layout: "../views/layouts/dashboard",
    });
  } catch (error) {
    console.error("Error fetching note:", error);
    res.status(500).send("An error occurred while fetching the note.");
  }
};

/**
 * POST /dashboard/note/:id/edit
 * Submit Edit Note
 */
exports.dashboardEditNoteSubmit = [
  body('title').notEmpty().withMessage('Title is required.'),
  body('body').notEmpty().withMessage('Body is required.'),
  
  async (req, res) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      const note = await Note.findById(req.params.id);
      return res.render('dashboard/Creator/update', {
        errors: errors.array(),
        noteID: req.params.id,
        note: { title: req.body.title, body: req.body.body }, // Use submitted values
        layout: "../views/layouts/dashboard",
      });
    }

    try {
      const updatedNote = await Note.findOneAndUpdate(
        { _id: req.params.id, user: req.user.id },
        { title: req.body.title, body: req.body.body },
        { new: true }
      );

      if (!updatedNote) {
        return res.status(404).send("Note not found.");
      }

      res.redirect('/dashboard');
    } catch (error) {
      console.error("Error updating note:", error);
      res.status(500).send("An error occurred while updating the note.");
    }
  }
];

/**
 * Generate a unique key for the note
 */
const generateUniqueKey = () => {
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

/**
 * GET /dashboard/note/:id/convert
 * Convert Note to URL
 */
exports.dashboardConvertNote = async (req, res) => {
  const noteId = req.params.id;

  try {
    const note = await Note.findOne({ _id: noteId, user: req.user.id });
    if (!note) {
      return res.status(404).send("Note not found.");
    }

    const convertedUrl = `${baseUrl}/dashboard/note/view/${noteId}`; // Use your actual domain and port

    note.convertedUrl = convertedUrl;
    note.uniqueKey = generateUniqueKey();
    await note.save(); // Save both URL and unique key

    res.render('dashboard/Creator/convert', {
      convertedUrl,
      uniqueKey: note.uniqueKey, // Pass the unique key to the view
      layout: "../views/layouts/dashboard",
    });
  } catch (error) {
    console.error("Error converting note:", error);
    res.status(500).send("An error occurred while converting the note.");
  }
};

/**
 * DELETE /dashboard/note/:id
 * Delete a note
 */
exports.dashboardDeleteNote = async (req, res) => {
  try {
    const noteId = req.params.id;
    const userId = req.user.id;

    const result = await Note.deleteOne({ _id: noteId, user: userId });

    if (result.deletedCount === 0) {
      return res.status(404).send("Note not found.");
    }

    res.redirect("/dashboard");
  } catch (error) {
    console.error("Error deleting note:", error);
    res.status(500).send("An error occurred while deleting the note.");
  }
};

/**
 * DELETE /dashboard/notes/delete-all
 * Delete all notes
 */
exports.dashboardDeleteAllNotes = async (req, res) => {
  try {
    const userId = req.user.id;
    await Note.deleteMany({ user: userId });
    res.redirect("/dashboard");
  } catch (error) {
    console.error("Error deleting all notes:", error);
    res.status(500).send("An error occurred while deleting all notes.");
  }
};


/**
 * GET /dashboard/retrieve
 * Display the retrieve note page
 */
exports.retrieveNotePage = (req, res) => {
  res.render('dashboard/Reader/retrieve_note', {
      convertedUrl: null, // Initialize as null,
      noteContent: null, // Initialize as null,
      error:null,
      layout: "../views/layouts/dashboard" // Adjust the layout as needed
  });
};

/**
 * GET /dashboard/retrieve
 * Retrieve Note by Unique Key
 */
/**
 * GET /dashboard/retrieve
 * Retrieve Note by Unique Key
 */
exports.retrieveNoteByKey = async (req, res) => {
  const { key } = req.query;

  if (!key) {
      return res.render('dashboard/Reader/retrieve_note', {
          convertedUrl: null,
          error: 'Key is required.',
          noteContent: null,
          layout: "../views/layouts/retrieve_note",
      });
  }

  try {
      const note = await Note.findOne({ uniqueKey: key }).lean();
      if (!note) {
          return res.render('dashboard/Reader/retrieve_note', {
              error: 'Incorrect key. Note not found.',
              convertedUrl: null,
              noteContent: null,
              layout: "../views/layouts/retrieve_note",
          });
      }

      const convertedUrl = `${baseUrl}/dashboard/note/view/${note._id}`;

      res.render('dashboard/Reader/retrieve_note', {
          convertedUrl,
          noteContent: note,
          layout: "../views/layouts/retrieve_note",
      });
  } catch (error) {
      console.error("Error retrieving note:", error);
      return res.render('dashboard/Reader/retrieve_note', {
          error: 'An error occurred while retrieving the note.',
          convertedUrl: null,
          noteContent: null,
          layout: "../views/layouts/retrieve_note",
      });
  }
};


/**
 * GET /dashboard/note/view/:id
 * View Note Content
 */
exports.viewNoteContent = async (req, res) => {
  const noteId = req.params.id;

  try {
    const note = await Note.findOne({ _id: noteId, user: req.user.id }).lean();
    
    if (!note) {
      return res.status(404).send("Note not found or you do not have access.");
    }

    res.render('dashboard/Reader/retrieve', {
      note,
      layout: "../views/layouts/dashboard",
    });
  } catch (error) {
    console.error("Error retrieving note content:", error);
    res.status(500).send("An error occurred while retrieving the note content.");
  }
};
