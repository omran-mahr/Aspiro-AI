import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Register = () => {
  const navigate = useNavigate();

  // Common fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Student-specific fields
  const [usn, setUsn] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [phone, setPhone] = useState("");
  const [semester, setSemester] = useState("");
  const [year, setYear] = useState("");
  const [course, setCourse] = useState("");
  const [deptName, setDeptName] = useState("");
  const [branch, setBranch] = useState("");
  const [cgpa, setCgpa] = useState("");
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState("");

  // College Mentor fields
  const [cmCourse, setCmCourse] = useState("");
  const [cmYear, setCmYear] = useState("");

  // Industry Mentor fields
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [industry, setIndustry] = useState("");

  const handlePhotoUpload = async (file) => {
    const formData = new FormData();
    formData.append("photo", file);

    const res = await axios.post("http://localhost:5000/uploads/profile", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    setProfilePhotoUrl(res.data.url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !password || !role) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      let registerUrl = "";
      let data = { name, email, password };

      if (role === "Student") {
        registerUrl = "http://localhost:5000/student/register";
        data = {
          name,
          usn,
          collegeName,
          email,
          password,
          phone,
          semester,
          year,
          course,
          deptName,
          branch,
          cgpa,
          profilePhotoUrl,
        };
      } else if (role === "CollegeMentor") {
        registerUrl = "http://localhost:5000/collegeMentor/register";
        data.course = cmCourse;
        data.year = cmYear;
      } else if (role === "IndustryMentor") {
        registerUrl = "http://localhost:5000/industryMentor/register";
        data.company = company;
        data.location = location;
        data.industry = industry;
      }

      await axios.post(registerUrl, data);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Register</h2>

        {error && <p className="text-red-500">{error}</p>}

        <form onSubmit={handleSubmit}>
          {/* Common fields */}
          <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="input" />
          <input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" />
          <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" />

          <select value={role} onChange={(e) => setRole(e.target.value)} className="input">
            <option value="" disabled>Select Role</option>
            <option value="Student">Student</option>
            <option value="CollegeMentor">College Mentor</option>
            <option value="IndustryMentor">Industry Mentor</option>
          </select>

          {/* Student fields */}
          {role === "Student" && (
            <>
              <input placeholder="USN" value={usn} onChange={(e) => setUsn(e.target.value)} className="input" />
              <input placeholder="College Name" value={collegeName} onChange={(e) => setCollegeName(e.target.value)} className="input" />
              <input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="input" />
              <input placeholder="Semester" value={semester} onChange={(e) => setSemester(e.target.value)} className="input" />
              <input placeholder="Year" value={year} onChange={(e) => setYear(e.target.value)} className="input" />
              <input placeholder="Course" value={course} onChange={(e) => setCourse(e.target.value)} className="input" />
              <input placeholder="Department Name" value={deptName} onChange={(e) => setDeptName(e.target.value)} className="input" />
              <input placeholder="Branch" value={branch} onChange={(e) => setBranch(e.target.value)} className="input" />
              <input placeholder="CGPA" type="number" value={cgpa} onChange={(e) => setCgpa(e.target.value)} className="input" />

              {/* Photo Upload */}
              <input type="file" accept="image/*" onChange={(e) => { setProfilePhoto(e.target.files[0]); handlePhotoUpload(e.target.files[0]); }} />
              {profilePhotoUrl && <img src={`http://localhost:5000${profilePhotoUrl}`} alt="Profile" className="w-20 h-20 mt-2 rounded-full" />}
            </>
          )}

          {/* College Mentor fields */}
          {role === "CollegeMentor" && (
            <>
              <input placeholder="Course" value={cmCourse} onChange={(e) => setCmCourse(e.target.value)} className="input" />
              <input placeholder="Year" value={cmYear} onChange={(e) => setCmYear(e.target.value)} className="input" />
            </>
          )}

          {/* Industry Mentor fields */}
          {role === "IndustryMentor" && (
            <>
              <input placeholder="Company" value={company} onChange={(e) => setCompany(e.target.value)} className="input" />
              <input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} className="input" />
              <input placeholder="Industry" value={industry} onChange={(e) => setIndustry(e.target.value)} className="input" />
            </>
          )}

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Loading..." : "Sign Up"}
          </button>
        </form>

        <p className="mt-4 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-500">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
