from __future__ import annotations

import json
import logging
import threading
import time
import uuid
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Callable

from django.conf import settings

from ..utils.contex_switches import compute_context_switches
from ..utils.hourly_breakdown import compute_hourly_productivity
from ..utils.monitor import is_unproductive_streak
from ..utils.prod_breakdown import compute_productivity_stats
from ..utils.script_combiner import label_activity_with_productivity

LOG = logging.getLogger(__name__)

DATA_DIR = settings.BASE_DIR.parent.parent / "data-backend"
ACTIVITY_FILE = DATA_DIR / "activity.jsonl"
ANALYSIS_FILE = DATA_DIR / "q_analysis.jsonl"
METRICS_FILE = DATA_DIR / "metrics.jsonl"
CONTEXT_SWITCHES_FILE = DATA_DIR / "context_switches.json"
HOURLY_FILE = DATA_DIR / "hourly_productivity.json"
SUMMARY_FILE = DATA_DIR / "productivity_summary.json"
MONITOR_FILE = DATA_DIR / "monitor_status.json"

DATA_DIR.mkdir(parents=True, exist_ok=True)


@dataclass(frozen=True)
class TaskSpec:
    name: str
    interval: int
    func: Callable[[], None]


_START_LOCK = threading.Lock()
_STARTED = False
_STOP_EVENT = threading.Event()
_THREADS: list[threading.Thread] = []


def _metrics_ready() -> bool:
    return METRICS_FILE.exists() and METRICS_FILE.stat().st_size > 0


def _atomic_write_json(path: Path, payload) -> None:
    text = json.dumps(payload, ensure_ascii=False, indent=2) + "\n"
    tmp = path.with_suffix(path.suffix + f".{uuid.uuid4().hex}.tmp")
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp.write_text(text, encoding="utf-8")
    tmp.replace(path)


def _run_combiner() -> None:
    try:
        act_exists = ACTIVITY_FILE.exists()
        ss_exists = ANALYSIS_FILE.exists()
        met_exists = METRICS_FILE.exists()
        act_size = ACTIVITY_FILE.stat().st_size if act_exists else 0
        ss_size = ANALYSIS_FILE.stat().st_size if ss_exists else 0
        met_size_before = METRICS_FILE.stat().st_size if met_exists else 0
        act_mtime = ACTIVITY_FILE.stat().st_mtime if act_exists else 0
        ss_mtime = ANALYSIS_FILE.stat().st_mtime if ss_exists else 0
        met_mtime_before = METRICS_FILE.stat().st_mtime if met_exists else 0
        LOG.info(
            "Combiner input: activity(size=%s, mtime=%s) q_analysis(size=%s, mtime=%s) metrics(size=%s, mtime=%s)",
            act_size,
            act_mtime,
            ss_size,
            ss_mtime,
            met_size_before,
            met_mtime_before,
        )

        rows = label_activity_with_productivity(
            str(ANALYSIS_FILE),
            str(ACTIVITY_FILE),
            str(METRICS_FILE),
        )
        met_size_after = METRICS_FILE.stat().st_size if METRICS_FILE.exists() else 0
        met_mtime_after = METRICS_FILE.stat().st_mtime if METRICS_FILE.exists() else 0
        LOG.info(
            "Updated metrics.jsonl with %s rows (size %s -> %s, mtime=%s)",
            rows,
            met_size_before,
            met_size_after,
            met_mtime_after,
        )
    except FileNotFoundError as exc:
        LOG.warning("Source data not found yet; combiner will retry: %s", exc)
    except ValueError as exc:
        LOG.warning("Combiner skipped: %s", exc)
    except Exception:
        LOG.exception("Combiner task failed")


def _run_context_switches() -> None:
    if not _metrics_ready():
        return
    try:
        data = compute_context_switches(METRICS_FILE)
        _atomic_write_json(CONTEXT_SWITCHES_FILE, data)
    except Exception:
        LOG.exception("Context switches task failed")


def _run_hourly_breakdown() -> None:
    if not _metrics_ready():
        return
    try:
        data = compute_hourly_productivity(METRICS_FILE)
        _atomic_write_json(HOURLY_FILE, data)
    except Exception:
        LOG.exception("Hourly breakdown task failed")


def _run_productivity_summary() -> None:
    if not _metrics_ready():
        return
    try:
        data = compute_productivity_stats(METRICS_FILE)
        _atomic_write_json(SUMMARY_FILE, data)
    except Exception:
        LOG.exception("Productivity summary task failed")


def _run_monitor() -> None:
    if not _metrics_ready():
        return
    try:
        unproductive = is_unproductive_streak(METRICS_FILE)
        payload = {
            "unproductive_streak": bool(unproductive),
            "checked_at": datetime.now(timezone.utc).isoformat(),
        }
        _atomic_write_json(MONITOR_FILE, payload)
    except Exception:
        LOG.exception("Monitor task failed")


_TASKS: tuple[TaskSpec, ...] = (
    TaskSpec("combiner", 15, _run_combiner),
    TaskSpec("context_switches", 60, _run_context_switches),
    TaskSpec("hourly_breakdown", 60, _run_hourly_breakdown),
    TaskSpec("productivity_summary", 60, _run_productivity_summary),
    TaskSpec("monitor", 30, _run_monitor),
)


def _worker(task: TaskSpec) -> None:
    LOG.info("Background task '%s' started (interval=%ss)", task.name, task.interval)
    while not _STOP_EVENT.is_set():
        start = time.monotonic()
        try:
            task.func()
        except Exception:
            LOG.exception("Unhandled error in task '%s'", task.name)
        elapsed = time.monotonic() - start
        sleep_for = max(task.interval - elapsed, 1)
        if _STOP_EVENT.wait(sleep_for):
            break
    LOG.info("Background task '%s' stopped", task.name)


def start_background_tasks() -> None:
    global _STARTED
    with _START_LOCK:
        if _STARTED:
            return
        _STOP_EVENT.clear()
        for spec in _TASKS:
            thread = threading.Thread(
                target=_worker,
                name=f"pyapp-bg-{spec.name}",
                args=(spec,),
                daemon=True,
            )
            thread.start()
            _THREADS.append(thread)
        _STARTED = True
        LOG.info("Started %s background task(s)", len(_TASKS))


def stop_background_tasks(timeout: float | None = 5.0) -> None:
    global _STARTED
    with _START_LOCK:
        if not _STARTED:
            return
        _STOP_EVENT.set()
        for thread in _THREADS:
            thread.join(timeout=timeout)
        _THREADS.clear()
        _STARTED = False
        LOG.info("Stopped background tasks")
