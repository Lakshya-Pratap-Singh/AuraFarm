function MissionCard({
  mission,
  onComplete,
  onDelete,
}) {
  return (
    <div className="mission-card">
      <h3>
        {mission.completed ? "✅" : "⭕"}{" "}
        {mission.title}
      </h3>

      <div>
        <button
          onClick={() =>
            onComplete(mission.id)
          }
        >
          {mission.completed
            ? "Mark Pending"
            : "Complete"}
        </button>

        <button
          onClick={() =>
            onDelete(mission.id)
          }
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default MissionCard;