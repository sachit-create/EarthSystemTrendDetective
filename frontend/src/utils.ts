import type { Dataset, VarKey } from "./types";

export const NO_TREND = "no significant trend";
export const GREY = "#94a3b8";

export const META: Record<VarKey, { label: string; unit: string; up: string; down: string }> = {
  temp: { label: "Temperature", unit: "°C", up: "#ef4444", down: "#3b82f6" },
  rain: { label: "Rainfall", unit: "mm/day", up: "#22c55e", down: "#f59e0b" },
};

export function colorFor(trend: string, v: VarKey): string {
  if (trend === "increasing") return META[v].up;
  if (trend === "decreasing") return META[v].down;
  return GREY;
}

/** Sen's-slope trend line: slope * year + median intercept. */
export function senTrendLine(
  years: number[],
  anomaly: (number | null)[],
  slope: number,
): number[] {
  const offs = anomaly
    .map((y, i) => (y === null ? null : y - slope * years[i]))
    .filter((v): v is number => v !== null)
    .sort((a, b) => a - b);
  if (!offs.length) return years.map(() => 0);
  const mid = Math.floor(offs.length / 2);
  const med = offs.length % 2 ? offs[mid] : (offs[mid - 1] + offs[mid]) / 2;
  return years.map((x) => +(slope * x + med).toFixed(3));
}

export function countTrends(data: Dataset, v: VarKey) {
  const all = Object.values(data.places).map((p) => p[v].trend);
  return {
    increasing: all.filter((t) => t === "increasing").length,
    decreasing: all.filter((t) => t === "decreasing").length,
    none: all.filter((t) => t === NO_TREND).length,
    total: all.length,
  };
}

export function strongest(data: Dataset, v: VarKey): string | null {
  const sig = Object.entries(data.places).filter(([, p]) => p[v].trend !== NO_TREND);
  if (!sig.length) return null;
  sig.sort((a, b) => Math.abs(b[1][v].slope_per_year) - Math.abs(a[1][v].slope_per_year));
  return sig[0][0];
}

/** true = same trend label in every loaded period; null = only one period loaded. */
export function holdsAcrossPeriods(
  datasets: Record<string, Dataset>,
  place: string,
  v: VarKey,
): boolean | null {
  const trends = Object.values(datasets)
    .map((d) => d.places[place]?.[v].trend)
    .filter((t): t is string => t !== undefined);
  if (trends.length < 2) return null;
  return trends.every((t) => t === trends[0]);
}

export function sentence(place: string, v: VarKey, trend: string, change: number, p: number, years: number): string {
  const label = META[v].label.toLowerCase();
  if (trend === NO_TREND) return `${place}: no statistically significant ${label} trend (p = ${p}).`;
  const sign = change > 0 ? "+" : "";
  return `${place}: ${label} is ${trend}, about ${sign}${change} ${META[v].unit} over ${years} years (p = ${p}).`;
}

export function downloadCSV(data: Dataset) {
  const lines = ["place,variable,trend,slope_per_year,total_change,p_value"];
  for (const [name, p] of Object.entries(data.places)) {
    for (const v of ["temp", "rain"] as VarKey[]) {
      const r = p[v];
      lines.push([name, v, r.trend, r.slope_per_year, r.change_total, r.p].join(","));
    }
  }
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv" }));
  a.download = `trend_results_${data.period[0]}_${data.period[1]}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}
