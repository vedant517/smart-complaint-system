import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: {
    type: String,
    enum: ["USER", "OFFICER", "ADMIN"],
    default: "USER"
  }
});

export default mongoose.model("User", userSchema);
