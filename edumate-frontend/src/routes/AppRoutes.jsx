import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import SessionManagement from "../components/tutor/SessionManagement";
import HomePage from "../pages/HomePage";
import TutorDashboard from "../pages/TutorDashboard"; 
import { TutorProfile } from "../components/tutor/TutorProfile";
import TutorLayout from "../components/tutor/TutorLayout"; 
import AdminDashboard from "../pages/AdminDashboard";
import StudentDashboard from "../pages/StudentDashboard"; // ⬅️ add this

export default function AppRoutes() {
  return (
    <Routes>
      {/* Auth pages */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Main app pages */}
      <Route path="/home" element={<HomePage />} />

      {/* Tutor routes with shared layout */}
      <Route path="/tutor" element={<TutorLayout />}>
        <Route index element={<TutorDashboard />} />
        <Route path="create-session" element={<SessionManagement />} />
        <Route path="profile" element={<TutorProfile />} />
      </Route>

      {/* Admin route */}
      <Route path="/admin" element={<AdminDashboard />} />

      {/* Student route */}
      <Route path="/student" element={<StudentDashboard />} />  {/* ⬅️ new route */}

      {/* Catch-all fallback */}
      <Route path="*" element={<Login />} />
    </Routes>
  );
}
