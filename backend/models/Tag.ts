import mongoose, { Schema, Document } from "mongoose";

export interface ITag extends Document {
  name: string;
  slug: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

const TagSchema = new Schema<ITag>(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true,
      unique: true,
    },
    slug: { 
      type: String, 
      required: true, 
      unique: true,
      lowercase: true,
      trim: true,
    },
    color: {
      type: String,
      required: true,
      default: "#3b5bdb",
    },
  },
  { timestamps: true },
);

// Индекс для поиска по названию
TagSchema.index({ name: "text" });

export const Tag = mongoose.model<ITag>("Tag", TagSchema);
