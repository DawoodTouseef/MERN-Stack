import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: true,
    maxLength: 32,
    unique: true,
  },
  user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  
});

export default mongoose.model("Category", categorySchema);
