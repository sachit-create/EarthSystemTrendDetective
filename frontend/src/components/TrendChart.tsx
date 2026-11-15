import {
  BarController,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import { Chart } from "react-chartjs-2";
import type { Dataset, VarKey } from "../types";
import { META, senTrendLine, sentence } from "../utils";

ChartJS.register(
  BarController, LineController, BarElement, LineElement, PointElement,
  CategoryScale, LinearScale, Tooltip, Legend,
);

interface Props {
  data: Dataset;
  variable: VarKey;
  place: string | null;
  theme: "light" | "dark";
}

export default function TrendChart({ data, variable, place, theme }: Props) {
  if (!place) {
    return (
      <div className="chart-card chart-empty">
        <div>
          <div className="empty-icon">↗</div>
          <h3>Click a place on the map</h3>
          <p>Its yearly anomaly chart and trend will appear here.</p>
        </div>
      </div>
    );
  }
  const p = data.places[place];
  const r = p[variable];
  const m = META[variable];
  const years = data.period[1] - data.period[0];

  const chartText = theme === "dark" ? "#aab3c2" : "#687385";
    const chartGrid = theme === "dark" ? "#303744" : "#e1e7ef";
    const chartLine = theme === "dark" ? "#e8eaed" : "#202124";

  return (
    <div className="chart-card">
      <div className="section-heading">
        <div>
          <h3 className="section-title">{place}: {m.label} anomaly</h3>
          <p className="section-subtitle">Year-by-year departure from the long-term average</p>
        </div>
      </div>
      <div className="chart-wrap">
        <Chart
          type="bar"
          data={{
            labels: p.years,
            datasets: [
              {
                type: "bar" as const,
                label: "Yearly anomaly",
                data: r.anomaly,
                backgroundColor: r.anomaly.map((v) => ((v ?? 0) >= 0 ? m.up : m.down)),
                order: 2,
              },
              {
                type: "line" as const,
                label: "Sen's slope trend",
                data: senTrendLine(p.years, r.anomaly, r.slope_per_year),
                borderColor: chartLine,
                borderDash: [6, 4],
                borderWidth: 2,
                pointRadius: 0,
                order: 1,
              },
            ],
          }}
          options={{
            plugins: { legend: { labels: { color: chartText } } },
            scales: {
              x: { ticks: { color: chartText, maxTicksLimit: 8 }, grid: { color: chartGrid } },
              y: {
                ticks: { color: chartText },
                grid: { color: chartGrid },
                title: { display: true, text: `Anomaly (${m.unit})`, color: chartText },
              },
            },
          }}
        />
      </div>
      <p className="chart-note">
        {sentence(place, variable, r.trend, r.change_total, r.p, years)}
      </p>
    </div>
  );
}
