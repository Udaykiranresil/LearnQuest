import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Dashboard from "./pages/user/Dashboard";
import CourseCatalog from "./pages/user/CourseCatalog";
import CourseDetail from "./pages/user/CourseDetail";
import ProjectSubmission from "./pages/user/ProjectSubmission";
import Leaderboard from "./pages/user/Leaderboard";
import Profile from "./pages/user/Profile";

import AdminOverview from "./pages/admin/AdminOverview";
import AdminCourseManager from "./pages/admin/AdminCourseManager";
import AdminProjectManager from "./pages/admin/AdminProjectManager";
import AdminUserManager from "./pages/admin/AdminUserManager";

function RootRedirect() {
  const { currentUser } = useApp();
  if (!currentUser) return <Navigate to="/login" replace />;
  return <Navigate to={currentUser.role === "admin" ? "/admin" : "/app"} replace />;
}

function AppRoutes() {
  const { ready } = useApp();
  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-void)]">
        <p className="text-sm text-[var(--color-muted)] tracking-wide">Loading LearnQuest…</p>
      </div>
    );
  }
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<Login />} />

      <Route path="/app" element={<ProtectedRoute requireRole="user"><Dashboard /></ProtectedRoute>} />
      <Route path="/app/courses" element={<ProtectedRoute requireRole="user"><CourseCatalog /></ProtectedRoute>} />
      <Route path="/app/courses/:courseId" element={<ProtectedRoute requireRole="user"><CourseDetail /></ProtectedRoute>} />
      <Route path="/app/projects/:projectId" element={<ProtectedRoute requireRole="user"><ProjectSubmission /></ProtectedRoute>} />
      <Route path="/app/leaderboard" element={<ProtectedRoute requireRole="user"><Leaderboard /></ProtectedRoute>} />
      <Route path="/app/profile" element={<ProtectedRoute requireRole="user"><Profile /></ProtectedRoute>} />

      <Route path="/admin" element={<ProtectedRoute requireRole="admin"><AdminOverview /></ProtectedRoute>} />
      <Route path="/admin/courses" element={<ProtectedRoute requireRole="admin"><AdminCourseManager /></ProtectedRoute>} />
      <Route path="/admin/projects" element={<ProtectedRoute requireRole="admin"><AdminProjectManager /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute requireRole="admin"><AdminUserManager /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}
