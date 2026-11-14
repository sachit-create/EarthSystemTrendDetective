export default function About() {
  return (
    <div className="rounded-xl bg-slate-900 p-4 text-sm leading-relaxed text-slate-400">
      <b className="text-slate-200">Why it matters</b>
      <p className="mt-1.5">
        Rajasthan and the surrounding plains are sensitive to heat and rainfall change, affecting farming, water
        supply and health. Showing where a trend is statistically real, and where it is not, helps separate genuine
        climate signals from natural year-to-year variation.
      </p>
      <p className="mt-2">
        <b className="text-slate-200">Limits:</b> POWER is a coarse (~50 km) model-assisted grid, so results show
        regional change, not city-level detail. A trend shows that something changed, not why. Temperature results
        that differ between periods should be treated as fragile.
      </p>
    </div>
  );
}
