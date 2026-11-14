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
}

export default function TrendChart({ data, variable, place }: Props) {
  if (!place) {
    return (
      <div className="rounded-xl bg-slate-900 p-4">
        <h3 className="text-lg font-semibold">Click a place on the map</h3>
        <p className="mt-2 text-sm text-slate-400">Its yearly anomaly chart and trend will appear here.</p>
      </div>
    );
  }
  const p = data.places[place];
  const r = p[variable];
  const m = META[variable];
  const years = data.period[1] - data.period[0];

  return (
    <div className="rounded-xl bg-slate-900 p-4">
      <h3 className="text-lg font-semibold">{place}: {m.label} anomaly</h3>
      <div className="mt-3">
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
                borderColor: "#ffffff",
                borderDash: [6, 4],
                borderWidth: 2,
                pointRadius: 0,
                order: 1,
              },
            ],
          }}
          options={{
            plugins: { legend: { labels: { color: "#94a3b8" } } },
            scales: {
              x: { ticks: { color: "#94a3b8", maxTicksLimit: 8 }, grid: { color: "#1e293b" } },
              y: {
                ticks: { color: "#94a3b8" },
                grid: { color: "#334155" },
                title: { display: true, text: `Anomaly (${m.unit})`, color: "#94a3b8" },
              },
            },
          }}
        />
      </div>
      <p className="mt-3 text-sm leading-relaxed text-slate-300">
        {sentence(place, variable, r.trend, r.change_total, r.p, years)}
      </p>
    </div>
  );
}
