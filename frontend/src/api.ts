import type { Dataset, PeriodsResponse } from "./types";

const BASE = import.meta.env.VITE_API_URL ?? "";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`Request ${path} failed (${res.status})`);
  return (await res.json()) as T;
}

export const fetchPeriods = () => get<PeriodsResponse>("/api/periods");
export const fetchData = (id: string) =>
  get<Dataset>(`/api/data?period=${encodeURIComponent(id)}`);
