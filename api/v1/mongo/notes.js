import express from "express";
import mongoose from "mongoose";
import { Note } from "../../../models/Note.js";
import { User } from "../../../models/User.js";
import {
  getAllNotes,
  createNote,
  addNote,
  editNote,
  togglePin,
  getUserNotes,
  deleteUserNote,
  searchUserNotes,
  getNoteById,
} from "./controllers/notesController.js";
import { authUser } from "../../../middleware/auth.js";

const router = express.Router();

// use these routes without auth
// get all notes (regardless of user)
router.get("/notes", getAllNotes);

// create a note
router.post("/notes", createNote);

// get a note by ID
router.get("/notes/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const note = await Note.findById(id);
    res
      .status(200)
      .json({ error: false, note, details: "Fetch a user successfully" });
  } catch (err) {
    res.status(500).json({
      error: true,
      message: "Failed to fatch a note",
      details: err.message,
    });
  }
});

// new get public notes for a user
// router.get("/public/:noteId", authUser, getNoteById);

// router.get("/public-notes/:id", async (req, res) => {
//   const { id } = req.params;
//   // const { fullName } = req.body;

//   try {
//     const user = await User.findById(id);
//     if (!user) {
//       console.log("no user");
//     }

//     // if (!fullName) {
//     //   console.log("no fullname");
//     // }
//     res.status(200).json({
//       error: false,
//       user,
//       message: "Fetch a public profile successfully",
//     });
//   } catch (err) {
//     res.status(500).json({
//       error: true,
//       message: "Failed to fetch a full name and user",
//       details: err.message,
//     });
//   }
// });

// update a user
router.put("/notes/:id", async (req, res) => {
  const payload = req.body;
  const { id } = req.params;

  try {
    const note = await Note.findByIdAndUpdate(id, { $set: payload });
    res.status(200).json({ note });
  } catch (err) {
    res.status(400).json({
      error: true,
      message: "Failed to update a user",
      details: err.message,
    });
  }
});

// delete a note
router.delete("/notes/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await Note.findByIdAndDelete(id);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({
      error: true,
      message: "Failed to delete a note",
      details: err.message,
    });
  }
});

// ...................... //

// use these routes after implimenting auth
// add note
router.post("/add-note", authUser, addNote);

// edit note
router.put("/edit-note/:noteId", authUser, editNote);

// update isPinned
router.put("/update-note-pinned/:noteId", authUser, togglePin);

// get all notes by user
router.get("/get-all-notes", authUser, getUserNotes);

// delete note
router.delete("/delete-note/:noteId", authUser, deleteUserNote);

// search notes
router.get("/search-notes", authUser, searchUserNotes);

// get a note by ID (protected route)
router.get("/get-note/:noteId", authUser, getNoteById);

// get public profile by user ID
router.get("/public-profile/:userId", authUser, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select(
      "fullName email"
    );

    if (!user) {
      return res.status(404).json({
        error: true,
        message: "user not found",
      });
    }
    res.status(200).json({
      error: false,
      user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: true,
      message: "Server error",
      details: err.message,
    });
  }
});

// get public notes for a user
router.get("/public-notes/:userId", async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({
      error: true,
      message: "Invalid user ID",
    });
  }

  try {
    const notes = await Note.find({
      userId,
      isPublic: true, // only fetch public notes
    }).sort({ createdOn: -1 }); //sort by creation date (newest first)

    res.status(200).json({
      error: false,
      notes,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: true,
      message: "Server error",
    });
  }
});

// update note visibility (publish/unpublish)
router.put("/notes/:noteId/visibility", authUser, async (req, res) => {
  const { isPublic } = req.body;
  const { user } = req.user;

  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.noteId, userId: user._id }, //ensure the note belongs to the user.
      { isPublic },
      { new: true } //return the updated note
    );

    if (!note) {
      return res.status(404).json({
        error: true,
        message: "Note not found or unauthorized",
      });
    }

    res.status(200).json({ error: false, note });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: true,
      message: "Server error",
    });
  }
});
export default router;
