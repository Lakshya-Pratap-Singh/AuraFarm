import { Routes, Route } from "react-router-dom";

import Dashboard from "../pages/Dashboard";
import Missions from "../pages/Missions";
import Objectives from "../pages/Objectives";
import Intelligence from "../pages/Intelligence";
import Settings from "../pages/Settings";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ProtectedRoute from "../components/ProtectedRoute";

function AppRoutes({
  missions,
  setMissions,
  objectives,
  setObjectives,
}) {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard missions={missions} objectives={objectives} />
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