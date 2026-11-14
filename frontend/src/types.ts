export type VarKey = "temp" | "rain";

export interface VarResult {
  trend: string;
  p: number;
  slope_per_year: number;
  change_total: number;
  anomaly: (number | null)[];
}

export interface Place {
  lat: number;
  lon: number;
  years: number[];
  temp: VarResult;
  rain: VarResult;
}

export interface Dataset {
  period: [number, number];
  places: Record<string, Place>;
}

export interface PeriodInfo {
  id: string;
  label: string;
}

export interface PeriodsResponse {
  default: string;
  periods: PeriodInfo[];
}
