const Student = require("../models/studentModel");
const CollegeMentor = require("../models/collegeMentorModel");
const IndustryMentor = require("../models/industryMentorModel");
const axios = require("axios");

// Register a student
exports.registerStudent = async (req, res) => {
  try {
    const { 
      name, 
      usn, 
      email, 
      password, 
      course, 
      year, 
      deptName, 
      collegeName,
      collegeMentorId,
      industryMentorId
    } = req.body;

    // Check if student already exists
    const existingStudent = await Student.findOne({ 
      $or: [{ email }, { usn }] 
    });
    if (existingStudent) {
      return res.status(400).json({ message: "Email or USN already in use" });
    }

    // Create new student
    const newStudent = new Student({ 
      name, 
      usn, 
      email, 
      password, 
      course, 
      year, 
      deptName, 
      collegeName,
      assignedCollegeMentor: collegeMentorId || null,
      assignedIndustryMentor: industryMentorId || null
    });
    await newStudent.save();
 
    // 📌 Mentor Mapping Logic (Only if no mentor IDs provided)
    if (!collegeMentorId && !industryMentorId) {
      // Try AI mapping service first
      try {
        const mapRes = await axios.post(
          "http://127.0.0.1:8000/map_student",
          { course: newStudent.course || "", year: newStudent.year || "", deptName: newStudent.deptName || "" },
          { timeout: 5000 }
        );

        if (mapRes.data?.mentors?.length) {
          const chosenId = mapRes.data.mentors[0].mentor_id;
          const assignedMentor = await CollegeMentor.findById(chosenId) || await IndustryMentor.findById(chosenId);

          if (assignedMentor) {
            if (assignedMentor instanceof CollegeMentor) {
              newStudent.assignedCollegeMentor = assignedMentor._id;
            } else {
              newStudent.assignedIndustryMentor = assignedMentor._id;
            }
            await newStudent.save();
            await assignedMentor.updateOne({ $addToSet: { assignedStudents: newStudent._id } });
          }
        }
      } catch (err) {
        console.error("AI mapping failed:", err.message);
      }

      // Fallback simple matching if AI fails
      if (!newStudent.assignedCollegeMentor && !newStudent.assignedIndustryMentor) {
        const allCollegeMentors = await CollegeMentor.find({});
        const allIndustryMentors = await IndustryMentor.find({});
        const mentors = [...allCollegeMentors, ...allIndustryMentors];

        let best = null;
        let bestScore = -999;

        mentors.forEach(m => {
          let score = 0;
          if (m.areaOfExpertise?.includes(newStudent.course)) score += 50;
          score += Math.max(0, 20 - Math.abs((m.yearsOfExperience || 0) - (newStudent.year || 0)));
          if (m.collegeName && m.collegeName === newStudent.collegeName) score += 10;
          if (score > bestScore) {
            bestScore = score;
            best = m;
          }
        });

        if (best) {
          if (best instanceof CollegeMentor) {
            newStudent.assignedCollegeMentor = best._id;
          } else {
            newStudent.assignedIndustryMentor = best._id;
          }
          await newStudent.save();
          await best.updateOne({ $addToSet: { assignedStudents: newStudent._id } });
        }
      }
    }

    res.status(201).json({
      message: "Student registered",
      user: newStudent
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Login a student
exports.loginStudent = async (req, res) => {
  try {
    const { email, password } = req.body;

    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Basic password check (Consider bcrypt in production)
    if (student.password !== password) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    res.status(200).json({ message: "Login successful", user: student });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all students
exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find();
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get student by ID
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate({
      path: "tasks.task",
    });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add attendance
exports.addAttendance = async (req, res) => {
  try {
    const { studentId, status } = req.body;

    if (!studentId || !status) {
      return res.status(400).json({ message: "Student ID and status are required." });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    const alreadyMarked = student.attendance.find(entry => {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === today.getTime();
    });

    if (alreadyMarked) {
      return res.status(200).json({ message: "Attendance already marked for today.", success: false });
    }

    student.attendance.push({ date: new Date(), status });
    await student.save();

    res.status(200).json({ message: "Attendance marked successfully", attendance: student.attendance });
  } catch (error) {
    console.error("Error marking attendance:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Add feedback
exports.addFeedbackToStudent = async (req, res) => {
  try {
    const { studentId, by, mentor, feedback } = req.body;

    if (!by || !mentor || !feedback) {
      return res.status(400).json({ message: "All feedback fields are required." });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    student.feedBack.push({ by, mentor, feedback });
    await student.save();

    res.status(200).json({ message: "Feedback added successfully.", student });
  } catch (error) {
    console.error("Error adding feedback:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Add image
exports.addImage = async (req, res) => {
  try {
    const { id, uploaded } = req.body;
    const student = await Student.findById(id);
    student.uploaded = uploaded;
    await student.save();
    return res.status(200).send({ success: true });
  } catch (error) {
    console.error("Error adding image:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Add badge
exports.addBadge = async (req, res) => {
  try {
    const { badge, id } = req.body;
    const student = await Student.findById(id);
    student.badge = badge;
    await student.save();
    return res.status(200).send({ success: true });
  } catch (error) {
    console.error("Error adding badge:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
