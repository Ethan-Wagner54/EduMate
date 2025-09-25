import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import CreateSession from "../pages/CreateSession";
import HomePage from "../pages/HomePage";
import TutorDashboard from "../pages/TutorDashboard"; 
// import StudentDashboard from "../pages/StudentDashboard";
// import AdminDashboard from "../pages/AdminDashboard";

// import SessionsList from "../pages/SessionsList";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Auth pages */}
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Main app pages */}
      <Route path="/home" element={<HomePage />} />
      <Route path="/create-session" element={<CreateSession />} />

      {/* Dashboards */}
      <Route path="/tutor" element={<TutorDashboard />} />
      {/* <Route path="/student" element={<StudentDashboard />} /> */}
      {/* <Route path="/admin" element={<AdminDashboard />} /> */}

      {/* Session management */}
      {/* <Route path="/sessions" element={<SessionsList />} /> */}

      {/* Catch-all fallback */}
      <Route path="*" element={<Login />} />
    </Routes>
  );
}
