const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    favorites: [
      {
        id:String,
        title:String,
        image: String, // recipe id (Edamam / internal)
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
