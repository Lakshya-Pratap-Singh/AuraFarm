import { useState } from "react";
import MissionCard from "../components/MissionCard";

function Missions({ missions, setMissions }) {
  const [missionInput, setMissionInput] = useState("");

  const handleAddMission = () => {
    if (!missionInput.trim()) return;

    const newMission = {
      id: Date.now(),
      title: missionInput,
      completed: false,
    };

    setMissions([...missions, newMission]);
    setMissionInput("");
  };

  const handleDeleteMission = (id) => {
    const updatedMissions = missions.filter(
      (mission) => mission.id !== id
    );

    setMissions(updatedMissions);
  };

  const handleCompleteMission = (id) => {
    const updatedMissions = missions.map((mission) => {
      if (mission.id === id) {
        return {
          ...mission,
          completed: !mission.completed,
        };
      }

      return mission;
    });

    setMissions(updatedMissions);
  };

  return (
    <div>
      <h1>Missions</h1>

      <p>Total Missions: {missions.length}</p>

      <input
        type="text"
        placeholder="Enter Mission"
        value={missionInput}
        onChange={(e) => setMissionInput(e.target.value)}
      />

      <button onClick={handleAddMission}>
        Add Mission
      </button>

      <hr />

      {missions.map((mission) => (
        <MissionCard
          key={mission.id}
          mission={mission}
          onComplete={handleCompleteMission}
          onDelete={handleDeleteMission}
        />
      ))}
    </div>
  );
}

export default Missions;