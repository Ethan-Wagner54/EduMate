import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
// import StudentDashboard from "../pages/StudentDashboard";
// import TutorDashboard from "../pages/TutorDashboard";
// import AdminDashboard from "../pages/AdminDashboard";
// import CreateSession from "../pages/CreateSession";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} /> 
      {/* <Route path="/student" element={<StudentDashboard />} /> */}
      {/* <Route path="/tutor" element={<TutorDashboard />} /> */}
      {/* <Route path="/admin" element={<AdminDashboard />} /> */}
      {/* <Route path="/create" element={<CreateSession />} /> */}
    </Routes>
  );
}
