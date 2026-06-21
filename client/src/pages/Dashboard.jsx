import DashboardWidgets from "../components/DashboardWidgets.jsx";
import "../styles/dashboard.css";

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

  const activeObjectives = objectives.filter(
    (objective) => !objective.completed
  ).length;

  const topObjective =
    [...objectives].sort(
      (a, b) => (b.progress || 0) - (a.progress || 0)
    )[0] || null;

  const categoryCounts = missions.reduce((acc, mission) => {
    const category = mission.category || "Learning";
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

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

  const difficultyLevels = missions.reduce(
    (sum, mission) => sum + (mission.difficulty === "Easy" ? 1 : 0),
    0
  );

  const averageDifficulty =
    totalMissions === 0
      ? 0
      : Math.round(
          missions.reduce((sum, mission) => {
            const map = { Easy: 1, Normal: 2, Hard: 3, Legendary: 4 };
            return sum + (map[mission.difficulty] || 2);
          }, 0) / totalMissions
        );

  const mostCompletedCategory = Object.entries(
    missions.reduce((acc, mission) => {
      if (mission.completed) {
        const category = mission.category || "Learning";
        acc[category] = (acc[category] || 0) + 1;
      }
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1])[0]?.[0] || "Learning";

  const highestPriorityMissionCount = priorityCounts.High || 0;
  const mostCommonCategory =
    Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    "Learning";
  const mostCommonDifficulty =
    Object.entries(difficultyCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    "Normal";

  const recentActivity = missions
    .slice()
    .sort((a, b) => (b.id || 0) - (a.id || 0))
    .slice(0, 6)
    .map((mission) => ({
      id: mission.id,
      title: mission.title,
      detail: mission.completed
        ? `${mission.category || "Learning"} · ${mission.difficulty || "Normal"}`
        : "In progress",
      time: mission.completed ? "Completed" : "Active",
    }));

  const weeklyData = [
    { label: "Mon", value: 3 },
    { label: "Tue", value: 5 },
    { label: "Wed", value: 4 },
    { label: "Thu", value: 6 },
    { label: "Fri", value: 7 },
    { label: "Sat", value: 5 },
    { label: "Sun", value: 8 },
  ];

  const currentStreak = Math.max(
    0,
    completedMissions > 0 ? Math.min(completedMissions, 12) : 0
  );

  return (
    <div className="dashboard">
      <DashboardWidgets
        completionRate={completionRate}
        currentStreak={currentStreak}
        activeObjectives={activeObjectives}
        topObjective={
          topObjective
            ? {
                ...topObjective,
                computedProgress: topObjective.progress ?? 0,
              }
            : null
        }
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
