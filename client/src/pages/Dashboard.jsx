import DashboardWidgets from "../components/DashboardWidgets.jsx";
import { recordSnapshot, getLast90Days, computeStreaks } from "../components/ActivityGrid.jsx";
import "../styles/dashboard.css";

// ── Objective progress — derived from linked missions, since objectives
// themselves don't store progress or a completed flag. (Previously this
// page read `objective.completed` / `objective.progress` directly, which
// don't exist on the objective object — those widgets were silently
// always wrong.) ──────────────────────────────────────────────────────
function getObjectiveProgress(objective, missions) {
  const related = missions.filter((m) => m.objectiveId === objective.id);
  if (related.length === 0) return { related, progress: 0 };
  const completedCount = related.filter((m) => m.completed).length;
  return { related, progress: Math.round((completedCount / related.length) * 100) };
}

// ── "Category" = linked Objective title, per your call — missions have
// no literal category field, so this reuses the existing objective link
// rather than introducing a new one. Unlinked missions group as
// "Unassigned" rather than a fabricated default. ────────────────────────
function getCategoryLabel(mission, objectives) {
  if (!mission.objectiveId) return "Unassigned";
  return objectives.find((o) => o.id === mission.objectiveId)?.title || "Unassigned";
}

// ── Relative time formatter for the activity feed ───────────────────────
function timeAgo(timestamp) {
  const diffMs = Date.now() - timestamp;
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function Dashboard({ missions, objectives }) {
  const totalMissions = missions.length;
  const completedMissions = missions.filter(
    (mission) => mission.completed
  ).length;
  const activeMissions = totalMissions - completedMissions;
  const completionRate =
    totalMissions === 0
      ? 0
      : Math.round((completedMissions / totalMissions) * 100);

  // ── Objectives — real progress derived from linked missions ──────────
  const objectivesWithProgress = objectives.map((o) => ({
    ...o,
    ...getObjectiveProgress(o, missions),
  }));

  const activeObjectives = objectivesWithProgress.filter(
    (o) => o.progress < 100
  ).length;

  const topObjectiveCandidate =
    objectivesWithProgress
      .filter((o) => o.related.length > 0)
      .sort((a, b) => b.progress - a.progress || b.related.length - a.related.length)[0] ||
    null;

  const topObjective = topObjectiveCandidate
    ? { ...topObjectiveCandidate, computedProgress: topObjectiveCandidate.progress }
    : null;

  // ── Category distribution — Objective-as-category (see note above) ──
  const categoryCounts = missions.reduce((acc, mission) => {
    const category = getCategoryLabel(mission, objectives);
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  const mostCommonCategory =
    Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Unassigned";

  const mostCompletedCategory =
    Object.entries(
      missions.reduce((acc, mission) => {
        if (mission.completed) {
          const category = getCategoryLabel(mission, objectives);
          acc[category] = (acc[category] || 0) + 1;
        }
        return acc;
      }, {})
    ).sort((a, b) => b[1] - a[1])[0]?.[0] || "Unassigned";

  // ── Difficulty / priority distributions — these fields are real, unchanged ──
  const difficultyCounts = missions.reduce((acc, mission) => {
    const difficulty = mission.difficulty || "Normal";
    acc[difficulty] = (acc[difficulty] || 0) + 1;
    return acc;
  }, {});

  const priorityCounts = missions.reduce((acc, mission) => {
    const priority = mission.priority || "Medium";
    acc[priority] = (acc[priority] || 0) + 1;
    return acc;
  }, {});

  const averageDifficulty =
    totalMissions === 0
      ? 0
      : Math.round(
          missions.reduce((sum, mission) => {
            const map = { Easy: 1, Normal: 2, Hard: 3, Legendary: 4 };
            return sum + (map[mission.difficulty] || 2);
          }, 0) / totalMissions
        );

  const highestPriorityMissionCount = priorityCounts.High || 0;
  const mostCommonDifficulty =
    Object.entries(difficultyCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Normal";

  // ── Shared activity log (same source Intelligence reads) — drives
  // both the real streak and the real weekly chart, instead of the
  // previous hardcoded array / completed-count-capped-at-12 fake streak ──
  const activityLog = recordSnapshot(missions);
  const last90Days = getLast90Days(activityLog);
  const { current: currentStreak } = computeStreaks(last90Days);

  const weeklyData = last90Days.slice(-7).map((day) => ({
    label: day.date.toLocaleDateString("en-US", { weekday: "short" }),
    value: day.rate,
  }));

  // ── Recent activity — real timestamps. Mission `id` doubles as a
  // creation timestamp (Date.now()); `completedAt` is stamped by
  // Missions.jsx's completion toggle. Previously this only used `id`
  // (so it was really "recently created", not "recent activity") and
  // showed literal strings "Completed"/"Active" instead of real times. ──
  const activityEvents = [];
  missions.forEach((mission) => {
    activityEvents.push({
      id: `${mission.id}-created`,
      title: mission.title,
      timestamp: mission.id,
      type: "created",
      detail: `Deployed · ${mission.priority || "Medium"} priority`,
    });
    if (mission.completed && mission.completedAt) {
      activityEvents.push({
        id: `${mission.id}-completed`,
        title: mission.title,
        timestamp: mission.completedAt,
        type: "completed",
        detail: `Completed · ${mission.difficulty || "Normal"} difficulty`,
      });
    }
  });

  const recentActivity = activityEvents
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 6)
    .map((event) => ({
      id: event.id,
      title: event.title,
      detail: event.detail,
      time: timeAgo(event.timestamp),
      type: event.type,
    }));

  return (
    <div className="dashboard">
      <DashboardWidgets
        completionRate={completionRate}
        currentStreak={currentStreak}
        activeObjectives={activeObjectives}
        topObjective={topObjective}
        mostCompletedCategory={mostCompletedCategory}
        mostCommonCategory={mostCommonCategory}
        highestPriorityMissionCount={highestPriorityMissionCount}
        mostCommonDifficulty={mostCommonDifficulty}
        averageDifficulty={averageDifficulty}
        difficultyCounts={difficultyCounts}
        categoryCounts={categoryCounts}
        weeklyData={weeklyData}
        recentActivity={recentActivity}
        totalMissions={totalMissions}
        completedMissions={completedMissions}
        activeMissions={activeMissions}
      />
    </div>
  );
}

export default Dashboard;