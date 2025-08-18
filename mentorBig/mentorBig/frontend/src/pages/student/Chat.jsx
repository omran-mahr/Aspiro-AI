import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { toast } from "react-toastify";
import Navbar from "../../components/Header";
import { ToastContainer } from "react-toastify";
import { motion } from "framer-motion";
import {
  FaUserCircle,
  FaPaperPlane,
  FaComments,
  FaBriefcase,
} from "react-icons/fa";

const socket = io("http://localhost:5000");

const Chat = () => {
  const [industryMentors, setIndustryMentors] = useState([]);
  const [collegeMentor, setCollegeMentors] = useState([]);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchIndustryMentors = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/industryMentor", {
          headers: { Authorization: token },
        });
        setIndustryMentors(res.data);
      } catch (error) {
        toast.error("Error fetching industry mentors");
      }
    };

    const fetchCollegeMentors = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/collegeMentor", {
          headers: { Authorization: token },
        });
        setCollegeMentors(res.data);
        console.log(res.data);
      } catch (error) {
        toast.error("Error fetching industry mentors");
      }
    };
    fetchCollegeMentors();
    fetchIndustryMentors();

    // Join student's socket room
    socket.emit("joinUser", user?._id);

    // Listen for incoming messages
    socket.on("sendPrivateMessageStudenttoIndustry", (message) => {
      if (
        message.sender === user?._id ||
        message.receiverIndustry === selectedMentor?._id
      ) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => {
      socket.off("sendPrivateMessageStudenttoIndustry");
    };
  }, [selectedMentor, user?._id]);

  const loadMessages = async (mentorId, mentorRole) => {
    const allMentors = [...industryMentors, ...collegeMentor];
    const mentor = allMentors.find((m) => m._id === mentorId);
    if (!mentor) return;

    setSelectedMentor(mentor);

    try {
      const res = await axios.post(
        "http://localhost:5000/messages/get",
        {
          user1: user._id,
          model1: user.role, // "Student"
          user2: mentor._id,
          model2: mentorRole, // "IndustryMentor" or "CollegeMentor"
        },
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );

      setMessages(res.data);
    } catch (error) {
      toast.error("Failed to load chat history");
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedMentor) return;

    const messagePayload = {
      sender: user._id,
      senderModel: user.role, // e.g., "Student"
      receiver: selectedMentor._id,
      receiverModel: selectedMentor.role, // e.g., "IndustryMentor"
      message: newMessage,
    };
    console.log(messagePayload);

    const tempMsg = {
      ...messagePayload,
      _id: Date.now(),
      createdAt: new Date(),
      read: false,
    };

    setMessages((prev) => [...prev, tempMsg]);
    setNewMessage("");

    socket.emit("sendMessage", messagePayload);

    try {
      await axios.post("http://localhost:5000/messages/send", messagePayload, {
        headers: { Authorization: localStorage.getItem("token") },
      });
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  useEffect(() => {
    socket.emit("join", user._id);

    socket.on("receiveMessage", (message) => {
      if (
        message.sender === selectedMentor?._id ||
        message.receiver === selectedMentor?._id
      ) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [selectedMentor, user?._id]);

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 min-h-screen flex">
      <Navbar />
      <ToastContainer />

      {/* Sidebar */}
      <motion.div
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="w-1/3 bg-gray-800 p-6 border-r border-gray-700 shadow-lg overflow-y-auto"
      >
        {/* Industry Mentors Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-purple-400 mb-4 flex items-center gap-2">
            <FaBriefcase className="text-purple-400" />
            Industry Mentors
          </h2>
          {industryMentors.length === 0 ? (
            <p className="text-gray-400">No industry mentors available.</p>
          ) : (
            <div className="space-y-2">
              {industryMentors.map((mentor) => (
                <motion.div
                  key={mentor._id}
                  whileHover={{ scale: 1.05 }}
                  className={`p-3 flex items-center gap-3 rounded-lg cursor-pointer transition-all ${
                    selectedMentor?._id === mentor._id
                      ? "bg-purple-900 bg-opacity-50"
                      : "hover:bg-gray-700"
                  }`}
                  onClick={() => loadMessages(mentor._id, "IndustryMentor")}
                >
                  <FaUserCircle className="text-3xl text-purple-400" />
                  <div>
                    <span className="font-semibold text-gray-100">
                      {mentor.name}
                    </span>
                    {mentor.industry && (
                      <p className="text-xs text-gray-400">{mentor.industry}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* College Mentors Section */}
        <div>
          <h2 className="text-2xl font-bold text-emerald-400 mb-4 flex items-center gap-2">
            <FaBriefcase className="text-emerald-400" />
            College Mentors
          </h2>
          {collegeMentor.length === 0 ? (
            <p className="text-gray-400">No college mentors available.</p>
          ) : (
            <div className="space-y-2">
              {collegeMentor.map((mentor) => (
                <motion.div
                  key={mentor._id}
                  whileHover={{ scale: 1.05 }}
                  className={`p-3 flex items-center gap-3 rounded-lg cursor-pointer transition-all ${
                    selectedMentor?._id === mentor._id
                      ? "bg-emerald-900 bg-opacity-50"
                      : "hover:bg-gray-700"
                  }`}
                  onClick={() => loadMessages(mentor._id, "CollegeMentor")}
                >
                  <FaUserCircle className="text-3xl text-emerald-400" />
                  <div>
                    <span className="font-semibold text-gray-100">
                      {mentor.name}
                    </span>
                    {mentor.department && (
                      <p className="text-xs text-gray-400">
                        {mentor.department}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Chat Area */}
      <motion.div
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="flex-1 flex flex-col bg-gray-800 p-6 shadow-lg"
      >
        {selectedMentor ? (
          <>
            <div className="flex items-center border-b border-gray-700 pb-4 mb-4 mt-[50px]">
              <FaUserCircle className="text-4xl text-purple-400" />
              <div className="ml-3">
                <h2 className="text-2xl font-bold text-gray-100">
                  {selectedMentor.name}
                </h2>
                <p className="text-sm text-gray-400">
                  {selectedMentor.role === "IndustryMentor"
                    ? "Industry Mentor"
                    : "College Mentor"}
                  {selectedMentor.industry && ` • ${selectedMentor.industry}`}
                  {selectedMentor.department &&
                    ` • ${selectedMentor.department}`}
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {messages.length === 0 ? (
                <p className="text-gray-500 text-center py-10">
                  No messages yet. Start the conversation!
                </p>
              ) : (
                messages.map((msg) => (
                  <motion.div
                    key={msg._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 max-w-xs rounded-lg ${
                      msg.sender === user._id
                        ? "bg-blue-600 text-white ml-auto"
                        : "bg-gray-700 text-gray-100"
                    }`}
                  >
                    {msg.message}
                    <p className="text-xs mt-1 opacity-70">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {msg.sender === user._id && (
                        <span className="ml-2">{msg.read ? "✓✓" : "✓"}</span>
                      )}
                    </p>
                  </motion.div>
                ))
              )}
            </div>

            <div className="border-t border-gray-700 pt-4 flex items-center gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                className="flex-1 p-3 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={sendMessage}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-all"
              >
                <FaPaperPlane /> Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <FaComments className="text-5xl text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-300">
                Select a mentor to chat with
              </h3>
              <p className="text-gray-500 mt-2">
                Choose from the sidebar to start your conversation
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Chat;
