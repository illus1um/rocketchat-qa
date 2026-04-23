"""Summarise docker-stats sample files into per-container metrics +
generates a CPU/memory line chart for the Assignment 3 report.

Input: results/performance/resource-sample-*.jsonl
Output:
  results/performance/resource-summary.json
  docs/assignment3/charts/resource-usage.png
"""
from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

ROOT = Path(__file__).resolve().parents[1]
PERF = ROOT / "results" / "performance"
CHARTS = ROOT / "docs" / "assignment3" / "charts"
CHARTS.mkdir(parents=True, exist_ok=True)


def load_records() -> dict[str, list[dict]]:
    per_container: dict[str, list[dict]] = {}
    for f in sorted(PERF.glob("resource-sample-*.jsonl")):
        for line in f.read_text(encoding="utf-8").splitlines():
            if not line.strip():
                continue
            r = json.loads(line)
            per_container.setdefault(r["name"], []).append(r)
    return per_container


def summarise(per_container: dict[str, list[dict]]) -> dict:
    out = {}
    for name, recs in per_container.items():
        if not recs:
            continue
        cpus = [r["cpu_pct"] for r in recs]
        mems = [r["mem_pct"] for r in recs]
        out[name] = {
            "samples": len(recs),
            "cpu_mean_pct": round(sum(cpus) / len(cpus), 2),
            "cpu_max_pct": round(max(cpus), 2),
            "mem_mean_pct": round(sum(mems) / len(mems), 2),
            "mem_max_pct": round(max(mems), 2),
            "mem_usage_last": recs[-1].get("mem_usage"),
        }
    return out


def plot(per_container: dict[str, list[dict]]) -> None:
    if not per_container:
        return
    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(11, 6), sharex=True)
    colors = {
        "rocketchat-qa-rocketchat-1": "#e74c3c",
        "rocketchat-qa-mongodb-1": "#2c3e50",
    }
    for name, recs in per_container.items():
        if not recs:
            continue
        t0 = datetime.fromisoformat(recs[0]["ts"].replace("Z", "+00:00"))
        x = [(datetime.fromisoformat(r["ts"].replace("Z", "+00:00")) - t0).total_seconds() for r in recs]
        cpu = [r["cpu_pct"] for r in recs]
        mem = [r["mem_pct"] for r in recs]
        c = colors.get(name, "#7f8c8d")
        ax1.plot(x, cpu, "-", color=c, label=name.split("-")[-2])
        ax2.plot(x, mem, "-", color=c, label=name.split("-")[-2])
    ax1.set_ylabel("CPU (%)")
    ax1.set_title("Container resource usage during endurance run")
    ax1.legend()
    ax1.grid(True, alpha=0.3)
    ax2.set_ylabel("Memory (%)")
    ax2.set_xlabel("seconds since sampler start")
    ax2.legend()
    ax2.grid(True, alpha=0.3)
    fig.tight_layout()
    fig.savefig(CHARTS / "resource-usage.png", dpi=130)
    plt.close(fig)


def main() -> None:
    per = load_records()
    summary = summarise(per)
    out_json = PERF / "resource-summary.json"
    out_json.write_text(json.dumps(summary, indent=2), encoding="utf-8")
    plot(per)
    print(json.dumps(summary, indent=2))
    print(f"wrote {out_json}")
    print(f"wrote {CHARTS / 'resource-usage.png'}")


if __name__ == "__main__":
    main()
