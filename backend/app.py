import json
import re
from pathlib import Path

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

BASE = Path(__file__).parent
DIST = BASE.parent / "frontend" / "dist"      # built React app (optional)
DATA_DIRS = [BASE / "data", BASE]             # results files can live in either
LABELED = re.compile(r"^results_(\d{4})_(\d{4})\.json$")

app = Flask(__name__, static_folder=None)
CORS(app, resources={r"/api/*": {"origins": "*"}})


def discover():
    """Return ({period_id: path}, default_id). period_id looks like '1990_2025'."""
    found = {}
    for d in DATA_DIRS:
        if not d.is_dir():
            continue
        for f in sorted(d.glob("results_*.json")):
            m = LABELED.match(f.name)
            if m:
                found.setdefault(f"{m[1]}_{m[2]}", f)

    default_id = None
    for d in DATA_DIRS:
        main = d / "results.json"
        if main.exists():
            start, end = json.loads(main.read_text(encoding="utf-8"))["period"]
            default_id = f"{start}_{end}"
            found.setdefault(default_id, main)
            break
    if default_id is None and found:
        default_id = sorted(found)[0]
    return found, default_id


@app.get("/api/health")
def health():
    return jsonify(status="ok")


@app.get("/api/periods")
def periods():
    found, default_id = discover()
    if not found:
        return jsonify(error="No results file found. Run analysis.py first."), 404
    items = [{"id": i, "label": i.replace("_", "-")} for i in sorted(found)]
    return jsonify(default=default_id, periods=items)


@app.get("/api/data")
def data():
    found, default_id = discover()
    period_id = request.args.get("period") or default_id
    path = found.get(period_id)
    if path is None:
        return jsonify(error=f"Unknown period '{period_id}'"), 404
    return jsonify(json.loads(path.read_text(encoding="utf-8")))


# Serve the built React app when frontend/dist exists (single-link deployment)
@app.get("/", defaults={"path": ""})
@app.get("/<path:path>")
def spa(path):
    if path.startswith("api/"):
        return jsonify(error="Not found"), 404
    if DIST.is_dir():
        if path and (DIST / path).is_file():
            return send_from_directory(DIST, path)
        return send_from_directory(DIST, "index.html")
    return jsonify(message="API is running. Build the frontend or use the Vite dev server."), 200


if __name__ == "__main__":
    app.run(debug=False, port=5001, host='0.0.0.0')
