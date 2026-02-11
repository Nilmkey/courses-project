import mongoose from "mongoose";
import { UserRegistrationInput } from "../validation/UserScheme";

const User = new mongoose.Schema<UserRegistrationInput>({
  name: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["student", "teacher", "admin"],
    default: "student",
  },
  enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
}, {timestamps: true});

export default mongoose.model<UserRegistrationInput>("User", User);
