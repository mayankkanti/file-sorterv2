import json
import shutil
from pathlib import Path
from .models import AppConfig, AppSettings, FolderConfig, Rule

CONFIG_DIR = Path.home() / "AppData" / "Roaming" / "FileSorter"
CONFIG_PATH = CONFIG_DIR / "config.json"


def _default_config() -> AppConfig:
    return AppConfig(
        version="1.0.0",
        app=AppSettings(),
        watched_folders=[],
    )

def _to_dict(config: AppConfig) -> dict:
    return {
        "version": config.version,
        "app": {
            "run_on_startup": config.app.run_on_startup,
            "inactivity_seconds": config.app.inactivity_seconds,
            "notifications": config.app.notifications,
            "log_retention_days": config.app.log_retention_days,
        },
        "watched_folders": [
            {
                "id": f.id,
                "path": f.path,
                "enabled": f.enabled,
                "recursive": f.recursive,
                "rules": [
                    {
                        "id": r.id,
                        "type": r.type,
                        "enabled": r.enabled,
                        "destination": r.destination,
                        "extensions": r.extensions,
                    }
                    for r in f.rules
                ],
            }
            for f in config.watched_folders
        ],
    }

def _write_config(config: AppConfig) -> None:
    """Atomic save — temp file + rename so a crash never corrupts config."""
    CONFIG_DIR.mkdir(parents=True, exist_ok=True)
    tmp = CONFIG_PATH.with_suffix(".tmp")
    tmp.write_text(json.dumps(_to_dict(config), indent=2), encoding="utf-8")
    tmp.replace(CONFIG_PATH)


def load_config() -> AppConfig:
    # Case 1: first run — no file yet
    if not CONFIG_PATH.exists():
        config = _default_config()
        _write_config(config)
        return config

    # Case 2: file exists but is corrupt
    try:
        data = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        CONFIG_PATH.replace(CONFIG_PATH.with_suffix(".corrupt"))
        config = _default_config()
        _write_config(config)
        return config

    # Case 3: normal load
    app = AppSettings(**data["app"])
    folders = []
    for f in data["watched_folders"]:
        rules = [Rule(**r) for r in f["rules"]]
        folders.append(FolderConfig(
            id=f["id"],
            path=f["path"],
            enabled=f["enabled"],
            recursive=f.get("recursive", False),
            rules=rules,
        ))
    return AppConfig(version=data["version"], app=app, watched_folders=folders)


def get_watcher_paths(config: AppConfig) -> list[str]:
    return [f.path for f in config.watched_folders if f.enabled]