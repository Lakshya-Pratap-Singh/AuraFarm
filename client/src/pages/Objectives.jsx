import { useState } from "react";
import ObjectiveCard from "../components/ObjectiveCard";

function Objectives({
  objectives,
  setObjectives,
  missions,
}) {
  const [title, setTitle] = useState("");
  const [targetDate, setTargetDate] =
    useState("");

  const handleAddObjective = () => {
    if (!title.trim()) return;

    const newObjective = {
      id: Date.now(),
      title,
      targetDate,
    };

    setObjectives([
      ...objectives,
      newObjective,
    ]);

    setTitle("");
    setTargetDate("");
  };

  const handleDeleteObjective = (id) => {
    const updatedObjectives =
      objectives.filter(
        (objective) =>
          objective.id !== id
      );

    setObjectives(updatedObjectives);
  };

  return (
    <div>
      <h1>Objectives</h1>

      <p>
        Total Objectives:
        {objectives.length}
      </p>

      <input
        type="text"
        placeholder="Objective Title"
        value={title}
        onChange={(e) =>
          setTitle(e.target.value)
        }
      />

      <input
        type="date"
        value={targetDate}
        onChange={(e) =>
          setTargetDate(e.target.value)
        }
      />

      <button
        onClick={handleAddObjective}
      >
        Add Objective
      </button>

      <hr />

      {objectives.map((objective) => (
        <ObjectiveCard
          key={objective.id}
          objective={objective}
          missions={missions}
          onDelete={
            handleDeleteObjective
          }
        />
      ))}
    </div>
  );
}

export default Objectives;