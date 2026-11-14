import type { PeriodInfo, VarKey } from "../types";
import { GREY, META } from "../utils";

interface Props {
  variable: VarKey;
  onVariable: (v: VarKey) => void;
  periods: PeriodInfo[];
  periodId: string;
  onPeriod: (id: string) => void;
}

const pill = (active: boolean) =>
  `rounded-lg px-4 py-2 text-sm font-medium transition ${
    active ? "bg-sky-400 text-slate-900" : "bg-slate-700 text-slate-200 hover:bg-slate-600"
  }`;

export default function Controls({ variable, onVariable, periods, periodId, onPeriod }: Props) {
  const m = META[variable];
  return (
    <div className="rounded-xl bg-slate-900 p-4">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="flex gap-2">
          <button className={pill(variable === "temp")} onClick={() => onVariable("temp")}>Temperature</button>
          <button className={pill(variable === "rain")} onClick={() => onVariable("rain")}>Rainfall</button>
        </div>
        {periods.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Period</span>
            {periods.map((p) => (
              <button key={p.id} className={pill(periodId === p.id)} onClick={() => onPeriod(p.id)}>
                {p.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-300">
        <Legend color={m.up} text="Increasing" />
        <Legend color={m.down} text="Decreasing" />
        <Legend color={GREY} text="No significant trend" />
      </div>
    </div>
  );
}

function Legend({ color, text }: { color: string; text: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <i className="inline-block h-3 w-3 rounded-full" style={{ background: color }} />
      {text}
    </span>
  );
}
