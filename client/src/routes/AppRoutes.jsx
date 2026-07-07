import { Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "../pages/Dashboard";
import Missions from "../pages/Missions";
import Objectives from "../pages/Objectives";
import Intelligence from "../pages/Intelligence";
import Settings from "../pages/Settings";
import Login from "../pages/Login.jsx";
import ProtectedRoute from "../components/ProtectedRoute.jsx";

function AppRoutes({
  missions,
  setMissions,
  objectives,
  setObjectives,
}) {
  return (
    <Routes>
      {/* Public — the only unauthenticated route */}
      <Route path="/login" element={<Login />} />

      {/* Email/password registration no longer exists now that Google is
          the only sign-in method — send any old links/bookmarks to /login
          rather than leaving a dead route. Register.jsx itself is untouched
          on disk, just no longer wired into routing. */}
      <Route path="/register" element={<Navigate to="/login" replace />} />

      {/* Everything below is unchanged from before, just wrapped in
          ProtectedRoute — CRUD, props, and logic are identical. */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard
              missions={missions}
              setMissions={setMissions}
              objectives={objectives}
            />
          </ProtectedRoute>
        }
      />

      <Route
        path="/missions"
        element={
          <ProtectedRoute>
            <Missions
              missions={missions}
              setMissions={setMissions}
              objectives={objectives}
            />
          </ProtectedRoute>
        }
      />

      <Route
        path="/objectives"
        element={
          <ProtectedRoute>
            <Objectives
              objectives={objectives}
              setObjectives={setObjectives}
              missions={missions}
            />
          </ProtectedRoute>
        }
      />

      <Route
        path="/intelligence"
        element={
          <ProtectedRoute>
            <Intelligence missions={missions} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default AppRoutes;