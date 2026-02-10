import mongoose from "mongoose";
interface IUser {
  name: string;
  email: string;
  password: string;
  role: "student" | "teacher" | "admin";
  enrolledCourses: mongoose.Types.ObjectId[];
}
const User = new mongoose.Schema<IUser>({
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
});

export default mongoose.model<IUser>("User", User);
