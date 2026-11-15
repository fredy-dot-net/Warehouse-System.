// =====================================================================
// components/BarChart.jsx  -  a simple bar chart made with plain HTML and CSS
// (no chart library needed, so it also works offline)
//
// Props:
//   title  : heading of the chart
//   items  : list like [{ label: "Food", a: 80 }, ...]
//            "a" is the first number. "b" (optional) is a second number.
//   aName / bName : names of the two numbers, shown in the legend
// =====================================================================
function BarChart({ title, items, aName, bName }) {
  // Find the biggest number, so the longest bar fills the width.
  // Math.max(1, ...) avoids dividing by zero when every value is 0.
  const biggest = Math.max(1, ...items.flatMap((item) => [item.a, item.b || 0]));

  return (
    <div className="chart">
      <h3>{title}</h3>

      {/* Legend: small colour boxes that explain the bars */}
      {bName && (
        <p className="legend">
          <span className="swatch bar-a"></span> {aName}
          <span className="swatch bar-b"></span> {bName}
        </p>
      )}

      {items.map((item) => (
        <div className="chart-row" key={item.label}>
          <span className="chart-label">{item.label}</span>

          <div className="chart-bars">
            {/* The width of each bar is its share of the biggest value, in percent */}
            <div className="bar-line">
              <div className="bar bar-a" style={{ width: (item.a / biggest) * 100 + "%" }}></div>
              <span>{item.a}</span>
            </div>

            {/* Second bar, only if this chart has a second number */}
            {item.b !== undefined && (
              <div className="bar-line">
                <div className="bar bar-b" style={{ width: (item.b / biggest) * 100 + "%" }}></div>
                <span>{item.b}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default BarChart;
