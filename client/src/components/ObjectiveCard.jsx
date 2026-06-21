function ObjectiveCard({
  objective,
  missions,
  onDelete,
}) {
  const relatedMissions = missions.filter(
    (mission) =>
      mission.objectiveId === objective.id
  );

  const completedMissions =
    relatedMissions.filter(
      (mission) => mission.completed
    ).length;

  const progress =
    relatedMissions.length === 0
      ? 0
      : Math.round(
          (completedMissions /
            relatedMissions.length) *
            100
        );

  return (
    <div className="objective-card">
      <h3>{objective.title}</h3>

      <p>
        Progress: {progress}%
      </p>

      <progress
        value={progress}
        max="100"
      />

      <p>
        Missions:
        {completedMissions}/
        {relatedMissions.length}
      </p>

      <p>
        Target Date:
        {objective.targetDate}
      </p>

      <h4>Linked Missions</h4>

      {relatedMissions.length === 0 ? (
        <p>No missions assigned</p>
      ) : (
        <ul>
          {relatedMissions.map((mission) => (
            <li key={mission.id}>
              {mission.completed
                ? "✅"
                : "⭕"}{" "}
              {mission.title}
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={() =>
          onDelete(objective.id)
        }
      >
        Delete
      </button>
    </div>
  );
}

export default ObjectiveCard;