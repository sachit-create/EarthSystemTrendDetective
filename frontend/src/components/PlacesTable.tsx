import type { Dataset, VarKey } from "../types";
import { META, downloadCSV, holdsAcrossPeriods } from "../utils";

interface Props {
  data: Dataset;
  datasets: Record<string, Dataset>;
  variable: VarKey;
  selected: string | null;
  onSelect: (name: string) => void;
}

export default function PlacesTable({ data, datasets, variable, selected, onSelect }: Props) {
  return (
    <div className="rounded-xl bg-slate-900 p-4">
      <div className="max-h-80 overflow-auto">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 bg-slate-900 text-slate-400">
            <tr>
              <th className="py-1.5">Place</th>
              <th>Trend</th>
              <th>Slope/yr ({META[variable].unit})</th>
              <th>p</th>
              <th title="Same trend in every period?">Robust</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(data.places).map(([name, p]) => {
              const robust = holdsAcrossPeriods(datasets, name, variable);
              return (
                <tr
                  key={name}
                  onClick={() => onSelect(name)}
                  className={`cursor-pointer border-t border-slate-800 hover:bg-slate-800 ${
                    name === selected ? "bg-slate-800" : ""
                  }`}
                >
                  <td className="py-1.5">{name}</td>
                  <td>{p[variable].trend}</td>
                  <td>{p[variable].slope_per_year}</td>
                  <td>{p[variable].p}</td>
                  <td>{robust === null ? "–" : robust ? "✓" : "changes"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <button
        onClick={() => downloadCSV(data)}
        className="mt-3 rounded-lg border border-sky-400 px-3 py-1.5 text-sm text-sky-400 hover:bg-sky-400/10"
      >
        Download results (CSV)
      </button>
    </div>
  );
}
