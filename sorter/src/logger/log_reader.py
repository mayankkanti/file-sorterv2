from pathlib import Path
from collections import deque


LOG_DIR = Path.home() / "AppData" / "Roaming" / "FileSorter" / "logs"
(LOG_DIR / "app").mkdir(parents=True, exist_ok=True)
(LOG_DIR / "watcher").mkdir(parents=True, exist_ok=True)


def _read_last_lines(file_path: Path, lines: int) -> str:
    if not file_path.exists():
        return f"Log file not found: {file_path}"
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            last_lines = deque(f, maxlen=lines)
        return "".join(last_lines)
    except Exception as e:
        return f"Error reading log: {e}"


def read_app_log(lines: int = 200) -> str:
    log_file = LOG_DIR / "app" / "app.log"
    return _read_last_lines(log_file, lines)


def read_watcher_log(lines: int = 200) -> str:
    log_file = LOG_DIR / "watcher" / "watcher.log"
    return _read_last_lines(log_file, lines)

def clear_logs() -> None:
    cleared_count = 0
    for log_file in LOG_DIR.rglob("*"):
        if log_file.is_file():
            try:
                log_file.unlink()
                cleared_count += 1
            except PermissionError:
                try:
                    with open(log_file, "w", encoding="utf-8") as f:
                        f.truncate()
                    cleared_count += 1
                except Exception as e:
                    print(f"Failed to truncate {log_file.name}: {e}")
            except Exception as e:
                print(f"Failed to delete {log_file.name}: {e}")
    print(f"Successfully cleared/truncated {cleared_count} log file(s).")