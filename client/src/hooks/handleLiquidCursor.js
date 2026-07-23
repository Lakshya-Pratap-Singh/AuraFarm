// handleLiquidCursor — tracks pointer position within an element and
// writes it to CSS custom properties (--btn-liquid-x / --btn-liquid-y)
// so pure-CSS radial-gradient blobs can follow the cursor without a
// re-render. Used as the onMouseMove handler on .btn-add-expand
// buttons (see index.css's .btn-liquid-cursor rule, and the Add
// Mission / Add Objective buttons in Missions.jsx / Objectives.jsx).
export default function handleLiquidCursor(e) {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 100;
  const y = ((e.clientY - rect.top) / rect.height) * 100;
  e.currentTarget.style.setProperty("--btn-liquid-x", `${x}%`);
  e.currentTarget.style.setProperty("--btn-liquid-y", `${y}%`);
}