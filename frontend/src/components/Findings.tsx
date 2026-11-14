import type { Dataset, VarKey } from "../types";
import { META, countTrends, strongest } from "../utils";

export default function Findings({ data }: { data: Dataset }) {
  return (
    <div className="rounded-xl bg-slate-900 p-4">
      <h2 className="text-lg font-semibold">
        Key findings, {data.period[0]}-{data.period[1]}
      </h2>
      <div className="mt-3 space-y-3">
        {(["rain", "temp"] as VarKey[]).map((v) => {
          const c = countTrends(data, v);
          const top = strongest(data, v);
          return (
            <div key={v}>
              <p className="text-sm">
                <b>{META[v].label}:</b> increasing at <b style={{ color: META[v].up }}>{c.increasing}</b> of {c.total} places,
                decreasing at <b style={{ color: META[v].down }}>{c.decreasing}</b>,
                no significant trend at <b>{c.none}</b>.
              </p>
              {top && <p className="text-xs text-slate-400">Strongest change: {top}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
