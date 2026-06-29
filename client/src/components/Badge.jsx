// Badge — small label chip for category / difficulty / priority on Mission
// and Objective cards. Pure display component, no logic of its own — the
// caller decides what variant/tone to pass based on existing mission data
// (e.g. mission.difficulty, mission.priority).
//
// Usage:
//   <Badge tone="difficulty" value="Hard" />
//   <Badge tone="priority" value="High" />
//   <Badge tone="category" value="Fitness" />

import "../styles/badge.css";

const TONE_CLASS = {
  difficulty: "badge-tone-difficulty",
  priority: "badge-tone-priority",
  category: "badge-tone-category",
  xp: "badge-tone-xp",
};

function Badge({ tone = "category", value, className = "" }) {
  const toneClass = TONE_CLASS[tone] ?? TONE_CLASS.category;
  return (
    <span className={`badge-root ${toneClass} ${className}`.trim()}>
      {value}
    </span>
  );
}

export default Badge;