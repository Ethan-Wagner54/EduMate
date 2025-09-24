import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import CreateSession from "../pages/CreateSession";
import HomePage from "../pages/HomePage";
// import StudentDashboard from "../pages/StudentDashboard";
// import TutorDashboard from "../pages/TutorDashboard";
// import AdminDashboard from "../pages/AdminDashboard";

// import SessionsList from "../pages/SessionsList";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/CreateSession" element={<CreateSession />} />
      <Route path="/HomePage" element={<HomePage />} />  
      {/* <Route path="/student" element={<StudentDashboard />} /> */}
      {/* <Route path="/tutor" element={<TutorDashboard />} /> */}
      {/* <Route path="/admin" element={<AdminDashboard />} /> */}
  
      {/* <Route path="/sessions" element={<SessionsList />} /> */}
    </Routes>
  );
}
