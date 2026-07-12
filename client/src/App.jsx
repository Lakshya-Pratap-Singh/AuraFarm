import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import BottomNav from "./components/BottomNav";
import AppRoutes from "./routes/AppRoutes";
import RankUpOverlay from "./components/RankUpOverlay";
import PageTransition from "./components/PageTransition";
import { RelicUnlockProvider } from "./components/RelicUnlockOverlay";
import useBreakpoint from "./hooks/useBreakpoint";
import { useMissionReset, buildNewMission } from "./hooks/useMissionReset";

import "./styles/aura-theme.css";
import "./styles/sidebar.css";
import "./styles/bottom-nav.css";
import "./styles/dashboard.css";

const DEFAULT_PRIORITY = "Medium";
const DEFAULT_DIFFICULTY = "Normal";
const DEFAULT_CATEGORY = "Learning";

const PRIORITY_VALUES = new Set(["Low", "Medium", "High"]);
const DIFFICULTY_VALUES = new Set(["Easy", "Normal", "Hard", "Legendary"]);
const CATEGORY_VALUES = new Set(["Physical", "Mental", "Career", "Learning", "Health"]);

function normalizeMission(mission, fallbackId = Date.now()) {
  return {
    id:             mission?.id ?? fallbackId,
    title:          mission?.title ?? "Untitled Mission",
    completed:      Boolean(mission?.completed),
    objectiveId:    mission?.objectiveId ?? mission?.objective_id ?? null,
    priority:       PRIORITY_VALUES.has(mission?.priority) ? mission.priority : DEFAULT_PRIORITY,
    difficulty:     DIFFICULTY_VALUES.has(mission?.difficulty) ? mission.difficulty : DEFAULT_DIFFICULTY,
    category:       CATEGORY_VALUES.has(mission?.category) ? mission.category : DEFAULT_CATEGORY,
    recurrence:     mission?.recurrence    ?? "none",
    recurrenceDays: mission?.recurrenceDays ?? 1,
    lastResetDate:  mission?.lastResetDate  ?? new Date().toISOString().slice(0, 10),
    createdAt:      mission?.createdAt || mission?.created_at || new Date().toISOString(),
  };
}

function normalizeMissions(data) {
  if (!Array.isArray(data)) return [];
  return data.map((mission, index) => normalizeMission(mission, Date.now() + index));
}

const NAV_TO_PATH = {
  "Dashboard":    "/",
  "Missions":     "/missions",
  "Objectives":   "/objectives",
  "Intelligence": "/intelligence",
  "Stats":        "/intelligence",
  "Relics":       "/relics",
  "Settings":     "/settings",
};

const PATH_TO_NAV = {
  "/":             "Dashboard",
  "/missions":     "Missions",
  "/objectives":   "Objectives",
  "/intelligence": "Intelligence",
  "/relics":       "Relics",
  "/settings":     "Settings",
};

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isMobile } = useBreakpoint();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [missions, setMissions] = useState(() => {
    try {
      const saved = localStorage.getItem("missions");
      if (!saved) return normalizeMissions([
        { id: 1, title: "Morning Training", completed: false },
        { id: 2, title: "Read 20 Pages", completed: true },
      ]);
      return normalizeMissions(JSON.parse(saved));
    } catch { return normalizeMissions([]); }
  });

  const [objectives, setObjectives] = useState(() => {
    const saved = localStorage.getItem("objectives");
    return saved ? JSON.parse(saved) : [
      { id: 1, title: "Build AuraFarm", progress: null, targetDate: "2026-12-31" },
      { id: 2, title: "Become React Developer", progress: 60, targetDate: "2026-11-01" },
    ];
  });

  useEffect(() => {
    localStorage.setItem("missions", JSON.stringify(normalizeMissions(missions)));
  }, [missions]);

  useEffect(() => {
    localStorage.setItem("objectives", JSON.stringify(objectives));
  }, [objectives]);

  useMissionReset(missions, setMissions);

  useEffect(() => {
    if (isMobile && sidebarCollapsed) {
      setSidebarCollapsed(false);
    }
  }, [isMobile, sidebarCollapsed]);

  const activeNav = PATH_TO_NAV[location.pathname] || "Dashboard";

  const handleNavChange = (label) => {
    const path = NAV_TO_PATH[label];
    if (path) navigate(path);
  };

  return (
    <RelicUnlockProvider>
      <div className={`app-shell ${sidebarCollapsed ? 'app-shell--collapsed' : ''}`}>
        {/* Ambient theme backdrop — one persistent animated layer (drifting
            aura smoke, rising particles, a slow energy-wave sweep) behind
            every page, so navigating between routes doesn't flash a
            different background color underneath. Fixed + z-index:0, so
            it sits behind the sidebar/main-content regardless of scroll. */}
        <div className="aura-backdrop" aria-hidden="true">
          <div className="aura-energy-wave" />
          {[...Array(8)].map((_, i) => (
            <span
              key={i}
              className="aura-particle"
              style={{
                left: `${5 + i * 12}%`,
                animationDelay: `${i * 1.8}s`,
                "--aura-particle-drift": `${(i % 2 === 0 ? 1 : -1) * (20 + i * 4)}px`,
              }}
            />
          ))}
        </div>

        {isMobile ? (
          <BottomNav activeNav={activeNav} onNavChange={handleNavChange} />
        ) : (
          <Sidebar
            activeNav={activeNav}
            onNavChange={handleNavChange}
            onCollapseChange={setSidebarCollapsed}
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

        <RankUpOverlay />
        {/* RelicUnlockOverlay is rendered by RelicUnlockProvider above */}
      </div>
    </RelicUnlockProvider>
  );
}

export default App;