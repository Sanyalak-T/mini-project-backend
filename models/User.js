import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";

// create schema
const UserSchema = new Schema({
  fullName: { type: String },
  email: { type: String, unique: true, require: true },
  password: { type: String, require: true },
  createdOn: { type: Date, default: new Date().getTime() },
});

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  // salt => กำหนดให้เข้ารหัสกี่รอบ ปกติ 10 รอบ
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// user schema = model
// mongoose will use model name User and name our collection as users automatically
export const User = model("User", UserSchema);
