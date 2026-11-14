import { useEffect, useState } from "react";
import { fetchData, fetchPeriods } from "./api";
import About from "./components/About";
import Controls from "./components/Controls";
import Findings from "./components/Findings";
import PlacesTable from "./components/PlacesTable";
import TrendChart from "./components/TrendChart";
import TrendMap from "./components/TrendMap";
import type { Dataset, PeriodInfo, VarKey } from "./types";

export default function App() {
  const [periods, setPeriods] = useState<PeriodInfo[]>([]);
  const [datasets, setDatasets] = useState<Record<string, Dataset>>({});
  const [periodId, setPeriodId] = useState("");
  const [variable, setVariable] = useState<VarKey>("temp");
  const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const info = await fetchPeriods();
        const entries = await Promise.all(
          info.periods.map(async (p) => [p.id, await fetchData(p.id)] as const),
        );
        if (cancelled) return;
        setPeriods(info.periods);
        setDatasets(Object.fromEntries(entries));
        setPeriodId(info.default);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not load data");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const data = datasets[periodId];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <header className="border-b border-slate-800 px-5 py-4">
        <h1 className="text-xl font-bold">Earth System Trend Detective</h1>
        <p className="text-sm text-slate-400">
          Detecting long-term temperature and rainfall change using NASA POWER data
        </p>
      </header>

      {error && <p className="p-5 text-red-400">Could not load data: {error}. Is the Flask backend running?</p>}
      {!error && !data && <p className="p-5 text-slate-400">Loading…</p>}

      {data && (
        <main className="grid gap-4 p-4 lg:grid-cols-[1.4fr_1fr]">
          <section className="space-y-4">
            <Controls
              variable={variable}
              onVariable={setVariable}
              periods={periods}
              periodId={periodId}
              onPeriod={setPeriodId}
            />
            <TrendMap data={data} variable={variable} selected={selected} onSelect={setSelected} />
          </section>
          <section className="space-y-4">
            <Findings data={data} />
            <TrendChart data={data} variable={variable} place={selected} />
            <PlacesTable
              data={data}
              datasets={datasets}
              variable={variable}
              selected={selected}
              onSelect={setSelected}
            />
            <About />
          </section>
        </main>
      )}

      <footer className="px-5 pb-6 text-xs text-slate-500">
        Data: NASA POWER (monthly; yearly anomalies vs. each month's long-term average). Trend test: Mann-Kendall with
        Sen's slope; significant when p &lt; 0.05.
      </footer>
    </div>
  );
}
