const mongoose = require("mongoose");

const CollegeMentorSchema = new mongoose.Schema(
  {
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],
  phone: { type: String },
  designation: { type: String }, // Professor, HOD, etc.
  collegeName: { type: String },
  department: { type: String },
  experience: { type: Number }, // in years
  expertise: { type: String },
  linkedIn: { type: String },
  profilePhoto: { type: String },
  role: { type: String, default: "CollegeMentor" },
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

module.exports = mongoose.model("CollegeMentor", CollegeMentorSchema);
