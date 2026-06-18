function Dashboard({ missions }) {
  const totalMissions = missions.length;

  const completedMissions = missions.filter(
    (mission) => mission.completed
  ).length;

  const pendingMissions =
    totalMissions - completedMissions;

  const completionRate =
    totalMissions === 0
      ? 0
      : Math.round(
          (completedMissions / totalMissions) * 100
        );

  return (
    <div>
      <h1>Command Center</h1>

      <hr />

      <h2>Mission Status</h2>

      <p>
        Total Missions: {totalMissions}
      </p>

      <p>
        Completed Missions: {completedMissions}
      </p>

      <p>
        Pending Missions: {pendingMissions}
      </p>

      <p>
        Completion Rate: {completionRate}%
      </p>
    </div>
  );
}

export default Dashboard;