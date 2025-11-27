"""
Simple scheduler to run fetch_market_snapshot.py at regular intervals with market rotation.

Environment variables:
  SNAPSHOT_INTERVAL_SECONDS (default: 300)
  SNAPSHOT_ROTATION (default: "us,bist;us;bist")
      Format: "markets[:budget];..." e.g. "us:6;bist:2;us,bist:8"
      markets can be "us", "bist" or comma-separated combination.
  SNAPSHOT_LATEST_LINK (default: data/snapshots/latest.json)
"""

from __future__ import annotations

import logging
import os
import subprocess
import sys
import time
from pathlib import Path
from typing import List, Optional, Tuple

logging.basicConfig(level=logging.INFO, format="[%(asctime)s] %(levelname)s %(message)s")
logger = logging.getLogger("snapshot_scheduler")

SCRIPT_PATH = Path(__file__).with_name("fetch_market_snapshot.py")


def parse_rotation(config: str) -> List[Tuple[str, Optional[int]]]:
    entries: List[Tuple[str, Optional[int]]] = []
    for chunk in config.split(";"):
        chunk = chunk.strip()
        if not chunk:
            continue
        if ":" in chunk:
            markets, budget = chunk.split(":", 1)
            try:
                entries.append((markets, int(budget)))
            except ValueError:
                logger.warning("Invalid budget in rotation chunk '%s', ignoring budget", chunk)
                entries.append((markets, None))
        else:
            entries.append((chunk, None))
    if not entries:
        entries.append(("us,bist", None))
    return entries


def run_snapshot(markets: str, budget: Optional[int], latest_link: str) -> int:
    cmd = [
        sys.executable,
        str(SCRIPT_PATH),
        "--markets",
        markets,
        "--latest-link",
        latest_link,
    ]
    if budget is not None:
        cmd.extend(["--twelvedata-budget", str(budget)])

    logger.info("Running snapshot: markets=%s budget=%s", markets, budget if budget is not None else "default")
    process = subprocess.run(cmd, capture_output=True, text=True)
    if process.stdout:
        logger.info(process.stdout.strip())
    if process.stderr:
        logger.warning(process.stderr.strip())
    return process.returncode


def main():
    interval = int(os.getenv("SNAPSHOT_INTERVAL_SECONDS", "300"))
    rotation_config = os.getenv("SNAPSHOT_ROTATION", "us,bist;us;bist")
    latest_link = os.getenv("SNAPSHOT_LATEST_LINK", "data/snapshots/latest.json")
    rotation = parse_rotation(rotation_config)

    logger.info(
        "Snapshot scheduler started. Interval=%ss rotation=%s latest_link=%s",
        interval,
        rotation,
        latest_link,
    )

    while True:
        for markets, budget in rotation:
            code = run_snapshot(markets, budget, latest_link)
            if code != 0:
                logger.error("Snapshot command failed with code %s", code)
            time.sleep(interval)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        logger.info("Scheduler stopped by user")



