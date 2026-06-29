// DonutChart — SVG donut/pie chart with a glowing center readout and a
// legend list. Replaces the plain bar-list BreakdownChart for the
// Intelligence page's category/difficulty sections (BreakdownChart.jsx
// itself is untouched on disk, just no longer used here).
//
// Segments are shades of gold/amber rather than arbitrary rainbow
// colors — same "hierarchy through intensity, not hue" rule missions.css
// and objectives.css already follow, so a multi-slice chart still reads
// as one consistent app instead of a bolted-on charting library look.
//
// Usage:
//   <DonutChart title="CATEGORY BREAKDOWN" data={categoryCounts} />

import "../styles/donut-chart.css";

const GOLD_SHADES = ["#e0b85a", "#c19a3f", "#8a6c2b", "#f4d484", "#a67c2e", "#6b5220"];

function DonutChart({ title, data = {} }) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((sum, [, value]) => sum + value, 0);

  const size = 160;
  const stroke = 22;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativeFraction = 0;
  const segments = entries.map(([label, value], i) => {
    const fraction = total > 0 ? value / total : 0;
    const segmentLength = fraction * circumference;
    // Start each segment at 12 o'clock (-90deg) plus how far around the
    // ring previous segments have already consumed.
    const rotation = cumulativeFraction * 360 - 90;
    cumulativeFraction += fraction;

    return {
      label,
      value,
      percent: Math.round(fraction * 100),
      color: GOLD_SHADES[i % GOLD_SHADES.length],
      segmentLength,
      rotation,
    };
  });

  return (
    <div className="donut-card">
      <div className="donut-header">
        <span className="donut-title">{title}</span>
      </div>

      {total === 0 ? (
        <p className="donut-empty">No data yet.</p>
      ) : (
        <div className="donut-body">
          <div className="donut-svg-wrap">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
              <circle
                className="donut-track"
                cx={size / 2}
                cy={size / 2}
                r={radius}
                strokeWidth={stroke}
                fill="none"
              />
              {segments.map((seg) => (
                <circle
                  key={seg.label}
                  className="donut-segment"
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  strokeWidth={stroke}
                  fill="none"
                  stroke={seg.color}
                  strokeDasharray={`${seg.segmentLength} ${circumference - seg.segmentLength}`}
                  transform={`rotate(${seg.rotation} ${size / 2} ${size / 2})`}
                />
              ))}
            </svg>
            <div className="donut-center">
              <span className="donut-center-value">{total}</span>
              <span className="donut-center-label">TOTAL</span>
            </div>
          </div>

          <ul className="donut-legend">
            {segments.map((seg) => (
              <li className="donut-legend-row" key={seg.label}>
                <span
                  className="donut-legend-dot"
                  style={{ background: seg.color, boxShadow: `0 0 6px ${seg.color}` }}
                />
                <span className="donut-legend-label">{seg.label.toUpperCase()}</span>
                <span className="donut-legend-value">{seg.value}</span>
                <span className="donut-legend-percent">{seg.percent}%</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default DonutChart;