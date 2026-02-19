import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import DailyLog from './pages/DailyLog';
import Reports from './pages/Reports';
import Standup from './pages/Standup';
import Timesheet from './pages/Timesheet';
import Notes from './pages/Notes';
import AdminDashboard from './pages/AdminDashboard';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'Admin') return <Navigate to="/" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return children;
  return user?.role === 'Admin' ? <Navigate to="/admin" replace /> : <Navigate to="/" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/daily-log" element={<DailyLog />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/standup" element={<Standup />} />
        <Route path="/timesheet" element={<Timesheet />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
