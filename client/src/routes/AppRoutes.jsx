import { Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "../pages/Dashboard";
import Missions from "../pages/Missions";
import Objectives from "../pages/Objectives";
import Intelligence from "../pages/Intelligence";
import Relics from "../pages/Relics";
import Settings from "../pages/Settings";
import Login from "../pages/Login.jsx";
import ProtectedRoute from "../components/ProtectedRoute.jsx";

function AppRoutes({ missions, setMissions, objectives, setObjectives }) {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Navigate to="/login" replace />} />

      <Route path="/" element={<ProtectedRoute><Dashboard missions={missions} setMissions={setMissions} objectives={objectives} /></ProtectedRoute>} />
      <Route path="/missions" element={<ProtectedRoute><Missions missions={missions} setMissions={setMissions} objectives={objectives} /></ProtectedRoute>} />
      <Route path="/objectives" element={<ProtectedRoute><Objectives objectives={objectives} setObjectives={setObjectives} missions={missions} /></ProtectedRoute>} />
      <Route path="/intelligence" element={<ProtectedRoute><Intelligence missions={missions} /></ProtectedRoute>} />
      <Route path="/relics" element={<ProtectedRoute><Relics missions={missions} objectives={objectives} /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
    </Routes>
  );
}

export default AppRoutes;