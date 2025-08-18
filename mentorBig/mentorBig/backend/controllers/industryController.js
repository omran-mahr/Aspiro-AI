const Mentor = require("../models/industryMentorModel");

// @desc Register a new mentor
// @route POST /api/mentors/register
const registerMentor = async (req, res) => {
  const {
    name,
    email,
    password,
    phone,
    designation,
    company,
    domain,
    experience,
    linkedIn,
    location,
    role
  } = req.body;

  try {
    let mentor = await Mentor.findOne({ email });

    if (mentor) {
      return res.status(400).json({ message: "Mentor already exists" });
    }

    mentor = new Mentor({
      name,
      email,
      password,
      phone,
      designation,
      company,
      domain,
      experience,
      linkedIn,
      location,
      role
    });
    await mentor.save();

    res.status(201).json({ message: "Mentor registered successfully", mentor });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// @desc Login mentor
// @route POST /api/mentors/login
const loginMentor = async (req, res) => {
  const { email, password } = req.body;

  try {
    const mentor = await Mentor.findOne({ email });

    if (!mentor || mentor.password !== password) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({ message: "Login successful", user: mentor });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// @desc Get a single mentor by ID
// @route GET /api/mentors/:id
const getSingleMentor = async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.id);
    if (!mentor) {
      return res.status(404).json({ message: "Mentor not found" });
    }
    res.json(mentor);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// @desc Get all mentors
// @route GET /api/mentors
const getAllMentors = async (req, res) => {
  try {
    const mentors = await Mentor.find();
    res.json(mentors);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// @desc Add feedback to mentor
// @route POST /api/mentors/feedback
const addFeedbackToMentor = async (req, res) => {
  const { mentorId, by, student, feedback } = req.body;

  try {
    if (!by || !student || !feedback) {
      return res
        .status(400)
        .json({ message: "All feedback fields are required." });
    }

    const mentor = await Mentor.findById(mentorId);
    if (!mentor) {
      return res.status(404).json({ message: "Mentor not found." });
    }

    mentor.feedBack.push({ by, student, feedback });

    await mentor.save();

    res.status(200).json({ message: "Feedback added successfully.", mentor });
  } catch (error) {
    console.error("Error adding feedback:", error);
    res.status(500).json({ message: "Server error. Could not add feedback." });
  }
};

module.exports = {
  registerMentor,
  loginMentor,
  getSingleMentor,
  getAllMentors,
  addFeedbackToMentor,
};
