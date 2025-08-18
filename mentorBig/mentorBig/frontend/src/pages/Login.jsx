import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios"; // Make sure you have axios installed

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // State for error messages
  const navigate = useNavigate(); // Hook to navigate after successful login
  const [role, setRole] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (role === "Admin") {
      if (email === "admin@gmail.com" && password === "admin123") {
        navigate("/adminStudents");
      } else {
        alert("Invalid Credentials");
        return;
      }
    }

    // Determine the backend URL based on the role

    let registerUrl = "";
    if (role === "Student") {
      registerUrl = "http://localhost:5000/student/login";
    } else if (role === "College Mentor") {
      registerUrl = "http://localhost:5000/collegeMentor/login";
    } else if (role === "Industry Mentor") {
      registerUrl = "http://localhost:5000/industryMentor/login";
    }

    try {
      // Send login request to backend
      const response = await axios.post(registerUrl, {
        email,
        password,
      });

      // Save user data to localStorage
      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("role", role);

      // Navigate based on the role
      if (role === "Student") {
        navigate("/ats");
      } else if (role === "College Mentor") {
        navigate("/college-chats");
      } else if (role === "Industry Mentor") {
        navigate("/ind-chats");
      }
    } catch (error) {
      // Handle login error
      setErrorMessage(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="h-screen flex items-center justify-end bg-[url('https://img.freepik.com/free-vector/seminar-concept-illustration_114360-7480.jpg?t=st=1743744820~exp=1743748420~hmac=5e55e42055b39a3225095390702bef58ce208a30d0443f3fce0bb417953a8b25&w=1380')] bg-cover ">
      <div className="w-full h-full   flex items-center justify-end">
        <div className="bg-opacity-65 bg-white shadow-lg rounded-lg p-8 max-w-md w-full mr-10 font-serif">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
            LOGIN
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="email"
              >
                Email Address
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="mb-6">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="password"
              >
                Password
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="mb-6">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="role"
              >
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                id="role"
                className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option hidden>Select your role</option>
                <option value="Admin">Admin</option>
                <option value="Student">Student</option>
                <option value="College Mentor">College Mentor</option>
                <option value="Industry Mentor">Industry Mentor</option>
              </select>
            </div>

            {/* Display error message if login fails */}
            {errorMessage && (
              <p className="text-red-500 text-sm mb-4">{errorMessage}</p>
            )}

            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="bg-purple-500 text-center hover:bg-purple-600 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline w-full"
              >
                Sign In
              </button>
            </div>

            <p className="text-center text-gray-600 text-[16px] mt-4">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-purple-500 hover:text-purple-700 font-bold"
              >
                Register
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
