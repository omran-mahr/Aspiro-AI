const mongoose = require("mongoose");

const IndustryMentorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    designation: { type: String }, // Senior Software Engineer, etc.
    company: { type: String },
    domain: { type: String }, // AI, Web Dev, Cybersecurity, etc.
    experience: { type: Number },
    linkedIn: { type: String },
    location: { type: String },
    role: { type: String, default: "IndustryMentor" },
    createdAt: { type: Date, default: Date.now },
    feedBack: [
      {
        by: {
          type: String,
        },
        student: {
          type: String,
        },
        feedback: {
          type: String,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("IndustryMentor", IndustryMentorSchema);
