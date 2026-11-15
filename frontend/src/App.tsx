import { useEffect, useState } from "react";
import { fetchData, fetchPeriods } from "./api";
import About from "./components/About";
import Controls from "./components/Controls";
import Findings from "./components/Findings";
import PlacesTable from "./components/PlacesTable";
import TrendChart from "./components/TrendChart";
import TrendMap from "./components/TrendMap";
import type { Dataset, PeriodInfo, VarKey } from "./types";

type Theme = "light" | "dark";

function LoadingSkeleton() {
  return (
    <div className="loading-dashboard" role="status" aria-live="polite" aria-label="Loading climate datasets">
      <div className="skeleton-card skeleton-map"><span className="skeleton-shimmer" /></div>
      <div className="skeleton-side">
        <div className="skeleton-card skeleton-controls"><span className="skeleton-shimmer" /></div>
        <div className="skeleton-card skeleton-chart"><span className="skeleton-shimmer" /></div>
      </div>
    </div>
  );
}

export default function App() {
  const [periods, setPeriods] = useState<PeriodInfo[]>([]);
  const [datasets, setDatasets] = useState<Record<string, Dataset>>({});
  const [periodId, setPeriodId] = useState("");
  const [variable, setVariable] = useState<VarKey>("temp");
  const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem("trend-detective-theme");
    return saved === "dark" ? "dark" : "light";
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("trend-detective-theme", theme);
  }, [theme]);

  useEffect(() => {
    const updateHeaderState = () => setIsScrolled(window.scrollY > 12);
    updateHeaderState();
    window.addEventListener("scroll", updateHeaderState, { passive: true });
    return () => window.removeEventListener("scroll", updateHeaderState);
  }, []);

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
    <div className="app-shell">
      <header className={`topbar${isScrolled ? " topbar-scrolled" : ""}`}>
        <div className="topbar-inner">
          <div className="brand-lockup">
            <div>
              <p className="brand-product">Earth System Trend Detective</p>
            </div>
          </div>
          <div className="header-actions">
            <span className="live-status"><i /> NASA POWER data</span>
            <button
              className="theme-toggle"
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              aria-pressed={theme === "dark"}
              title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              <span aria-hidden="true">{theme === "light" ? "☾" : "☀"}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="page-wrap">
        <section className="hero-row">
          <div>
            <p className="eyebrow">Climate signals, made clearer</p>
            <h1>See how the Earth is changing.</h1>
            <p className="hero-copy">Explore long-term temperature and rainfall trends across Rajasthan and the surrounding plains.</p>
          </div>
          <div className="hero-badge"><span className="hero-badge-dot" /> Interactive research view</div>
        </section>

      {error && <div className="notice notice-error"><strong>Could not load data.</strong> {error}. Is the Flask backend running?</div>}
      {!error && !data && <LoadingSkeleton />}

      {data && (
        <div className="dashboard-content">
          <div className="dashboard-grid">
            <section className="map-column">
              <TrendMap data={data} variable={variable} selected={selected} onSelect={setSelected} theme={theme} />
            </section>
            <section className="controls-column">
              <Controls
                variable={variable}
                onVariable={setVariable}
                periods={periods}
                periodId={periodId}
                onPeriod={setPeriodId}
                canReset={selected !== null}
                onReset={() => setSelected(null)}
              />
              <TrendChart data={data} variable={variable} place={selected} theme={theme} />
            </section>
          </div>

          <div className="summary-grid">
            <Findings data={data} />
            <About />
          </div>

          <PlacesTable
            data={data}
            datasets={datasets}
            variable={variable}
            selected={selected}
            onSelect={setSelected}
          />
        </div>
      )}

      </main>

      <footer className="site-footer">
        <span>Earth System Trend Detective</span>
        <span>Data: NASA POWER · Trend test: Mann–Kendall with Sen’s slope · Significant when p &lt; 0.05</span>
      </footer>
    </div>
  );
}
