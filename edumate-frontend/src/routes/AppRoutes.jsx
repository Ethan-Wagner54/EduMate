import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import CreateSession from "../pages/CreateSession";
import HomePage from "../pages/HomePage";
import TutorDashboard from "../pages/TutorDashboard"; 
import TutorProfilePage from "../pages/TutorProfilePage";
import TutorLayout from "../components/tutor/TutorLayout"; 
import AdminDashboard from "../pages/AdminDashboard";
import AdminLayout from "../components/admin/AdminLayout";
import UserManagement from "../pages/admin/UserManagement";
import AdminSessionManagement from "../pages/admin/SessionManagement";
import ChatModeration from "../pages/admin/ChatModeration";
import Analytics from "../pages/admin/Analytics";
import StudentDashboard from "../pages/StudentDashboard";
import StudentLayout from "../components/student/StudentLayout";
import BrowseSessions from "../pages/BrowseSessions";
import MySessions from "../pages/MySessions";
import MyTutors from "../pages/MyTutors";
import Progress from "../pages/Progress";
import SessionHistory from "../pages/SessionHistory";
import Settings from "../pages/Settings";
import Profile from "../pages/Profile";
import TutorSessions from "../pages/TutorSessions";
import TutorMessages from "../pages/TutorMessages";
import Messages from "../pages/Messages";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Auth pages */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Main app pages */}
      <Route path="/home" element={<HomePage />} />

      {/* Tutor routes with shared layout */}
      <Route path="/tutor" element={<TutorLayout />}>
        <Route index element={<TutorDashboard />} />
        <Route path="create-session" element={<CreateSession />} />
        <Route path="sessions" element={<TutorSessions />} />
        <Route path="messages" element={<TutorMessages />} />
        <Route path="profile" element={<TutorProfilePage />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Admin routes with shared layout */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="sessions" element={<AdminSessionManagement />} />
        <Route path="chats" element={<ChatModeration />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Student routes with shared layout */}
      <Route path="/student" element={<StudentLayout />}>
        <Route index element={<StudentDashboard />} />
        <Route path="browse-sessions" element={<BrowseSessions />} />
        <Route path="my-sessions" element={<MySessions />} />
        <Route path="my-tutors" element={<MyTutors />} />
        <Route path="messages" element={<Messages />} />
        <Route path="progress" element={<Progress />} />
        <Route path="session-history" element={<SessionHistory />} />
        <Route path="settings" element={<Settings />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Catch-all fallback */}
      <Route path="*" element={<Login />} />
    </Routes>
  );
}
