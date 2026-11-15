import type { Dataset, VarKey } from "../types";
import { META, countTrends, strongest } from "../utils";

export default function Findings({ data }: { data: Dataset }) {
  return (
    <div className="findings-card">
      <div className="section-heading">
        <div>
          <h2 className="section-title">Key findings</h2>
          <p className="section-subtitle">Signals across {data.period[0]}–{data.period[1]}</p>
        </div>
        <span className="hero-badge">{Object.keys(data.places).length} places</span>
      </div>
      <div className="finding-list">
        {(["rain", "temp"] as VarKey[]).map((v) => {
          const c = countTrends(data, v);
          const top = strongest(data, v);
          return (
            <div key={v} className="finding-item">
              <p>
                <b>{META[v].label}:</b> increasing at <b className="trend-number" style={{ color: META[v].up }}>{c.increasing}</b> of {c.total} places,
                decreasing at <b className="trend-number" style={{ color: META[v].down }}>{c.decreasing}</b>,
                no significant trend at <b className="trend-number">{c.none}</b>.
              </p>
              {top && <p>Strongest change: {top}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
