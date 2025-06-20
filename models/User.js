const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String },
  googleId: { type: String },
  role: {
    type: String,
    enum: ["attendee", "speaker", "organizer"],
    default: "attendee",
  },
  name: { type: String, required: true },
  bio: { type: String },
});

module.exports = mongoose.model("User", UserSchema);
