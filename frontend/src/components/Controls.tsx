import type { PeriodInfo, VarKey } from "../types";
import { GREY, META } from "../utils";

interface Props {
  variable: VarKey;
  onVariable: (v: VarKey) => void;
  periods: PeriodInfo[];
  periodId: string;
  onPeriod: (id: string) => void;
  canReset: boolean;
  onReset: () => void;
}

const pill = (active: boolean) => `choice${active ? " active" : ""}`;

export default function Controls({ variable, onVariable, periods, periodId, onPeriod, canReset, onReset }: Props) {
  const m = META[variable];
  return (
    <div className="controls-card">
      <div className="controls-top">
        <div className="control-group" role="group" aria-label="Choose climate variable">
          <button type="button" className={pill(variable === "temp")} aria-pressed={variable === "temp"} onClick={() => onVariable("temp")}>Temperature</button>
          <button type="button" className={pill(variable === "rain")} aria-pressed={variable === "rain"} onClick={() => onVariable("rain")}>Rainfall</button>
        </div>
        {periods.length > 1 && (
          <div className="control-group" role="group" aria-label="Choose time period">
            <span className="control-label">Period</span>
            {periods.map((p) => (
              <button type="button" key={p.id} className={pill(periodId === p.id)} aria-pressed={periodId === p.id} onClick={() => onPeriod(p.id)}>
                {p.label}
              </button>
            ))}
          </div>
        )}
        <button type="button" className="reset-button" onClick={onReset} disabled={!canReset} aria-label="Clear selected place">
          Reset selection
        </button>
      </div>
      <div className="legend-row">
        <Legend color={m.up} text="Increasing" />
        <Legend color={m.down} text="Decreasing" />
        <Legend color={GREY} text="No significant trend" />
      </div>
    </div>
  );
}

function Legend({ color, text }: { color: string; text: string }) {
  return (
    <span className="legend-item">
      <i className="legend-dot" style={{ background: color }} />
      {text}
    </span>
  );
}
