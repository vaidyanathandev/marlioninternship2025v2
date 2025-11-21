import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./components/Toast";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Pages
import Home from "./pages/Home";
import Register from "./pages/Register";
import AIInterview from "./pages/AIInterview";
import Status from "./pages/Status";
import OfferLetter from "./pages/OfferLetter";
import Rejected from "./pages/Rejected";
import Dashboard from "./pages/Dashboard";
import Certificate from "./pages/Certificate";
import Banned from "./pages/Banned";

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <div className="min-h-screen bg-marlion-bg">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />

              {/* Registration Flow */}
              <Route
                path="/register"
                element={
                  <ProtectedRoute requireAuth={false}>
                    <Register />
                  </ProtectedRoute>
                }
              />

              {/* Interview Flow - Requires student role and specific status */}
              <Route
                path="/interview"
                element={
                  <ProtectedRoute
                    requireRole={["STUDENT"]}
                    requireStatus={["REGISTERED", "INTERVIEW_PENDING"]}
                  >
                    <AIInterview />
                  </ProtectedRoute>
                }
              />

              {/* Status Check - After interview completion */}
              <Route
                path="/status"
                element={
                  <ProtectedRoute
                    requireRole={["STUDENT"]}
                    requireStatus={["INTERVIEW_COMPLETED", "UNDER_REVIEW"]}
                  >
                    <Status />
                  </ProtectedRoute>
                }
              />

              {/* Offer Letter - For selected candidates */}
              <Route
                path="/offer"
                element={
                  <ProtectedRoute requireRole={["STUDENT"]} requireStatus={["OFFER_RELEASED"]}>
                    <OfferLetter />
                  </ProtectedRoute>
                }
              />

              {/* Rejection Page */}
              <Route
                path="/rejected"
                element={
                  <ProtectedRoute requireRole={["STUDENT"]} requireStatus={["REJECTED"]}>
                    <Rejected />
                  </ProtectedRoute>
                }
              />

              {/* Main Dashboard - For accepted students */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute
                    requireRole={["STUDENT"]}
                    requireStatus={["OFFER_ACCEPTED", "ACTIVE"]}
                  >
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              {/* Certificate - For completed students */}
              <Route
                path="/certificate"
                element={
                  <ProtectedRoute requireRole={["STUDENT"]} requireStatus={["COMPLETED"]}>
                    <Certificate />
                  </ProtectedRoute>
                }
              />

              {/* Banned Page */}
              <Route
                path="/banned"
                element={
                  <ProtectedRoute requireRole={["STUDENT"]} requireStatus={["BANNED"]}>
                    <Banned />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
