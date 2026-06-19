import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";

// Lazy load pages for performance optimization
const Login = React.lazy(() => import("./pages/Login"));
const Register = React.lazy(() => import("./pages/Register"));
const AdminLayout = React.lazy(
  () => import("./pages/admin/components/AdminLayout"),
);
const AdminDashboard = React.lazy(() => import("./pages/admin/Dashboard"));
const Locations = React.lazy(() => import("./pages/admin/Locations"));
const Workers = React.lazy(() => import("./pages/admin/Workers"));
const Slots = React.lazy(() => import("./pages/admin/Slots"));
const Pricing = React.lazy(() => import("./pages/admin/Pricing"));
const WorkerDashboard = React.lazy(() => import("./pages/worker/Dashboard"));
const EnterpriseDashboard = React.lazy(
  () => import("./pages/admin/EnterpriseDashboard"),
);
const Landing = React.lazy(() => import("./pages/Landing"));

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading)
    return (
      <div className="loader-container">
        <div className="spinner"></div>
      </div>
    );

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const { user, loading } = useAuth();

  if (loading)
    return (
      <div className="loader-container">
        <div className="spinner"></div>
      </div>
    );

  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#1e293b",
            color: "#f8fafc",
            border: "1px solid rgba(255,255,255,0.1)",
          },
        }}
      />
      <React.Suspense
        fallback={
          <div className="loader-container">
            <div className="spinner"></div>
          </div>
        }
      >
        <Routes>
          <Route
            path="/login"
            element={!user ? <Login /> : <Navigate to="/" replace />}
          />
          <Route
            path="/register"
            element={!user ? <Register /> : <Navigate to="/" replace />}
          />

          {/* Route Director based on role */}
          <Route
            path="/"
            element={
              !user ? (
                <Landing />
              ) : user.role === "WORKER" ? (
                <Navigate to="/worker/dashboard" replace />
              ) : user.role === "SUPER_ADMIN" ? (
                <Navigate to="/admin/enterprise" replace />
              ) : (
                <Navigate to="/admin/dashboard" replace />
              )
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["SUPER_ADMIN", "PARKING_ADMIN"]}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route 
              path="enterprise" 
              element={
                <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
                  <EnterpriseDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="dashboard" 
              element={
                <ProtectedRoute allowedRoles={["PARKING_ADMIN"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="locations" 
              element={
                <ProtectedRoute allowedRoles={["PARKING_ADMIN"]}>
                  <Locations />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="workers" 
              element={
                <ProtectedRoute allowedRoles={["PARKING_ADMIN"]}>
                  <Workers />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="slots" 
              element={
                <ProtectedRoute allowedRoles={["PARKING_ADMIN"]}>
                  <Slots />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="pricing" 
              element={
                <ProtectedRoute allowedRoles={["PARKING_ADMIN"]}>
                  <Pricing />
                </ProtectedRoute>
              } 
            />
          </Route>

          {/* Worker Routes */}
          <Route
            path="/worker/*"
            element={
              <ProtectedRoute allowedRoles={["WORKER"]}>
                <WorkerDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </React.Suspense>
    </Router>
  );
}

export default App;
