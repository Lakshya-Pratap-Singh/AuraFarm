// BreakdownChart — horizontal bar-list, sorted by count descending.
//
// One component covers both planned pieces (CategoryBreakdownChart AND
// DifficultyBreakdownChart from the original spec) since they're the
// same visual shape with different data/title — passing title + counts
// avoids two near-identical files. Pure presentation, no calculation:
// caller (Intelligence.jsx) computes the counts from real mission fields.
//
// Usage:
//   <BreakdownChart title="CATEGORY BREAKDOWN" counts={categoryCounts} />
//   <BreakdownChart title="DIFFICULTY BREAKDOWN" counts={difficultyCounts} />

import "../styles/breakdown-chart.css";

function BreakdownChart({ title, counts = {} }) {
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const max = Math.max(...entries.map(([, count]) => count), 1);

  return (
    <div className="bd-card">
      <div className="bd-header">
        <span className="bd-title">{title}</span>
      </div>

      {entries.length === 0 ? (
        <p className="bd-empty">No data yet.</p>
      ) : (
        <div className="bd-list">
          {entries.map(([label, count]) => (
            <div className="bd-row" key={label}>
              <span className="bd-row-label">{label.toUpperCase()}</span>
              <div className="bd-row-track">
                <div className="bd-row-fill" style={{ width: `${(count / max) * 100}%` }} />
              </div>
              <span className="bd-row-value">{count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BreakdownChart;