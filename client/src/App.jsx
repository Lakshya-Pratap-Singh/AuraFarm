import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import BottomNav from "./components/BottomNav";
import AppRoutes from "./routes/AppRoutes";
import RankUpOverlay from "./components/RankUpOverlay";
import PageTransition from "./components/PageTransition";
import useBreakpoint from "./hooks/useBreakpoint";

import "./styles/aura-theme.css";
import "./styles/sidebar.css";
import "./styles/bottom-nav.css";
import "./styles/dashboard.css";

const DEFAULT_PRIORITY = "Medium";
const DEFAULT_DIFFICULTY = "Normal";
const DEFAULT_CATEGORY = "Learning";

const PRIORITY_VALUES = new Set(["Low", "Medium", "High"]);
const DIFFICULTY_VALUES = new Set([
  "Easy",
  "Normal",
  "Hard",
  "Legendary",
]);
const CATEGORY_VALUES = new Set([
  "Physical",
  "Mental",
  "Career",
  "Learning",
  "Health",
]);

function normalizeMission(mission, fallbackId = Date.now()) {
  const normalized = {
    id: mission?.id ?? fallbackId,
    title: mission?.title ?? "Untitled Mission",
    completed: Boolean(mission?.completed),
    objectiveId:
      mission?.objectiveId ?? mission?.objective_id ?? null,
    priority: PRIORITY_VALUES.has(mission?.priority)
      ? mission.priority
      : DEFAULT_PRIORITY,
    difficulty: DIFFICULTY_VALUES.has(mission?.difficulty)
      ? mission.difficulty
      : DEFAULT_DIFFICULTY,
    category: CATEGORY_VALUES.has(mission?.category)
      ? mission.category
      : DEFAULT_CATEGORY,
    createdAt:
      mission?.createdAt ||
      mission?.created_at ||
      new Date().toISOString(),
  };

  return normalized;
}

function normalizeMissions(data) {
  if (!Array.isArray(data)) return [];

  return data.map((mission, index) =>
    normalizeMission(mission, Date.now() + index)
  );
}

// Sidebar speaks in nav LABELS, AppRoutes speaks in URL PATHS.
// These maps translate between the two so neither file needs to know
// about the other's convention.
// Sidebar speaks in nav LABELS, AppRoutes speaks in URL PATHS.
// Stats → same Intelligence page. Relics/Aura Shop/Profile not yet wired.
const NAV_TO_PATH = {
  "Dashboard":    "/",
  "Missions":     "/missions",
  "Objectives":   "/objectives",
  "Intelligence": "/intelligence",
  "Stats":        "/intelligence",
  "Settings":     "/settings",
};

const PATH_TO_NAV = {
  "/":             "Dashboard",
  "/missions":     "Missions",
  "/objectives":   "Objectives",
  "/intelligence": "Intelligence",
  "/settings":     "Settings",
};

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isMobile } = useBreakpoint();

  // Missions State
  const [missions, setMissions] = useState(() => {
    try {
      const savedMissions = localStorage.getItem("missions");
      if (!savedMissions) {
        return normalizeMissions([
          {
            id: 1,
            title: "Morning Training",
            completed: false,
          },
          {
            id: 2,
            title: "Read 20 Pages",
            completed: true,
          },
        ]);
      }

      return normalizeMissions(JSON.parse(savedMissions));
    } catch {
      return normalizeMissions([]);
    }
  });

  // Objectives State
  const [objectives, setObjectives] = useState(() => {
    const savedObjectives =
      localStorage.getItem("objectives");

    return savedObjectives
      ? JSON.parse(savedObjectives)
      : [
          {
            id: 1,
            title: "Build AuraFarm",
            progress: null,
            targetDate: "2026-12-31",
          },
          {
            id: 2,
            title: "Become React Developer",
            progress: 60,
            targetDate: "2026-11-01",
          },
        ];
  });

  // Save Missions
  useEffect(() => {
    localStorage.setItem(
      "missions",
      JSON.stringify(normalizeMissions(missions))
    );
  }, [missions]);

  // Save Objectives
  useEffect(() => {
    localStorage.setItem(
      "objectives",
      JSON.stringify(objectives)
    );
  }, [objectives]);

  const activeNav = PATH_TO_NAV[location.pathname] || "Dashboard";

  const handleNavChange = (label) => {
    const path = NAV_TO_PATH[label];
    if (path) navigate(path);
    // Relics / Aura Shop / Profile have no path yet — no-op until pages built
  };

  return (
    <div className="app-shell">
      {isMobile ? (
        <BottomNav activeNav={activeNav} onNavChange={handleNavChange} />
      ) : (
        <Sidebar
          activeNav={activeNav}
          onNavChange={handleNavChange}
        />
      )}

      <main className="main-content">
        <PageTransition>
          <AppRoutes
            missions={missions}
            setMissions={setMissions}
            objectives={objectives}
            setObjectives={setObjectives}
          />
        </PageTransition>
      </main>

      {/* Full-screen overlay — mounted at the app-shell root rather than
          inside <main>, so it can't get clipped by any overflow:hidden
          further down the tree. Reads level-up state from XPContext
          itself; needs no props from here. */}
      <RankUpOverlay />
    </div>
  );
}

export default App;