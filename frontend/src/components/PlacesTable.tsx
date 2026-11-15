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
    <div className="table-card">
      <div className="section-heading">
        <div>
          <h2 className="section-title">Place-by-place results</h2>
          <p className="section-subtitle">Select a row to inspect its anomaly chart</p>
        </div>
      </div>
      <div className="table-scroll">
        <table className="data-table" aria-label="Climate trend results by place">
          <thead>
            <tr>
              <th scope="col" className="py-1.5">Place</th>
              <th scope="col">Trend</th>
              <th scope="col">Slope/yr ({META[variable].unit})</th>
              <th scope="col">p</th>
              <th scope="col" title="Same trend in every period?">Robust</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(data.places).map(([name, p]) => {
              const robust = holdsAcrossPeriods(datasets, name, variable);
              return (
                <tr
                  key={name}
                  onClick={() => onSelect(name)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onSelect(name);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`View trend chart for ${name}`}
                  aria-pressed={name === selected}
                  className={name === selected ? "selected" : ""
                  }
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
        type="button"
        onClick={() => downloadCSV(data)}
        className="download-button"
        aria-label="Download climate trend results as CSV"
      >
        Download results (CSV)
      </button>
    </div>
  );
}
