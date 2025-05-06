import { Schema, model } from "mongoose";

// create schema
const NoteSchema = new Schema({
  title: { type: String, require: true },
  content: { type: String, required: true },
  tags: { type: [String], default: [] },
  isPinned: { type: Boolean, default: false },
  isPublic: { type: Boolean, default: false },
  userId: { type: String, required: true },
  createdOn: { type: Date, default: new Date().getTime() },
});

// user schema = model
export const Note = model("Note", NoteSchema);
