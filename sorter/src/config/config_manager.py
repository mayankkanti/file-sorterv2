import json
from win11toast import toast # type: ignore
from pathlib import Path
from .models import AppConfig, AppSettings, FolderConfig, Rule
from typing import Any

CONFIG_DIR = Path.home() / "AppData" / "Roaming" / "FileSorter"
CONFIG_PATH = CONFIG_DIR / "config.json"


# was rewritten by gemini 3.1 pro for better error handling

def _default_config() -> AppConfig:
    return AppConfig(
        version="1.0.0",
        app=AppSettings(),
        watched_folders=[],
    )

def to_dict(config: AppConfig) -> dict: # type: ignore
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
    } # type: ignore

def from_dict(data: dict[str, Any]) -> AppConfig:
    return AppConfig(
        version=data["version"],
        app=AppSettings(**data["app"]),
        watched_folders=[
            FolderConfig(
                id=folder["id"],
                path=folder["path"],
                enabled=folder["enabled"],
                recursive=folder["recursive"],
                rules=[
                    Rule(**rule)
                    for rule in folder["rules"]
                ],
            )
            for folder in data["watched_folders"]
        ],
    )

def _write_config(config: AppConfig) -> None:
    """Atomic save — temp file + rename so a crash never corrupts config."""
    CONFIG_DIR.mkdir(parents=True, exist_ok=True)
    tmp = CONFIG_PATH.with_suffix(".tmp")
    tmp.write_text(json.dumps(to_dict(config), indent=2), encoding="utf-8")
    tmp.replace(CONFIG_PATH)

def _validate_config(config: AppConfig) -> list[str]:
    errors: list[str] = []

    if config.app.inactivity_seconds < 1:
        errors.append("inactivity_seconds must be >= 1")

    folder_ids: set[str] = set()

    for folder in config.watched_folders:
        if not folder.path.strip():
            errors.append(f"Folder '{folder.id}' path must not be empty")

        if folder.id in folder_ids:
            errors.append(f"Duplicate folder id '{folder.id}'")
        folder_ids.add(folder.id)

        rule_ids: set[str] = set()

        for rule in folder.rules:
            if not rule.destination.strip():
                errors.append(f"Rule '{rule.id}' in folder '{folder.id}' has empty destination")

            if rule.id in rule_ids:
                errors.append(f"Duplicate rule id '{rule.id}' in folder '{folder.id}'")
            rule_ids.add(rule.id)

            for ext in rule.extensions:
                if not ext.startswith("."):
                    errors.append(f"Extension '{ext}' in rule '{rule.id}' must start with '.'")
    return errors

def save_config(config: AppConfig) -> None:
    errors = _validate_config(config)
    if errors:
        raise ValueError(f"Config validation failed: {errors}")
    _write_config(config)

def load_config() -> AppConfig:
    # Case 1: first run — no file yet
    if not CONFIG_PATH.exists():
        config = _default_config()
        _write_config(config)
        toast("FileSorter", "Config file was created.")
        return config

    # Case 2 & 3: file exists, parse, and validate schema
    try:
        data = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
        
        # Moving deserialization inside the try block catches KeyErrors/TypeErrors 
        # from manually broken JSON files.
        app = AppSettings(**data["app"])
        folders: list[FolderConfig] = []
        for f in data["watched_folders"]:
            rules = [Rule(**r) for r in f["rules"]]
            folders.append(FolderConfig(
                id=f["id"],
                path=f["path"],
                enabled=f["enabled"],
                recursive=f.get("recursive", False),
                rules=rules,
            ))
            
        config = AppConfig(version=data["version"], app=app, watched_folders=folders)
        
        # Ensure manually edited configs don't bypass validation rules
        errors = _validate_config(config)
        if errors:
            raise ValueError(f"Validation failed: {errors}")
            
        return config

    except Exception: # Catches JSONDecodeError, OSError, KeyError, TypeError, ValueError
        backup_path = CONFIG_PATH.with_suffix(".corrupt")
        
        # Prevent Windows FileExistsError during replacement
        if backup_path.exists():
            backup_path.unlink()
            
        CONFIG_PATH.replace(backup_path)
        
        config = _default_config()
        _write_config(config)
        toast("FileSorter", "Config file was corrupt and has been reset to defaults.")
        return config

def get_watcher_paths(config: AppConfig) -> list[str]:
    return [f.path for f in config.watched_folders if f.enabled]

def get_config_path() -> Path:
    return CONFIG_PATH

def get_log_paths() -> list[Path]:
    logs_dir = CONFIG_DIR / "logs"
    app_log = logs_dir / "app" / "app.log"
    watcher_log = logs_dir / "watcher" / "watcher.log"
    logs_dir.mkdir(parents=True, exist_ok=True)
    return [app_log, watcher_log]

def add_watched_folder(config: AppConfig, folder: FolderConfig) -> None:
    config.watched_folders.append(folder)
    save_config(config)

def update_watched_folder(config: AppConfig, folder_id: str, updated_folder: FolderConfig) -> None:
    for i, f in enumerate(config.watched_folders):
        if f.id == folder_id:
            config.watched_folders[i] = updated_folder
            save_config(config)
            return
    raise ValueError(f"Folder '{folder_id}' not found")

def remove_watched_folder(config: AppConfig, folder_id: str) -> None:
    filtered = [f for f in config.watched_folders if f.id != folder_id]
    if len(filtered) == len(config.watched_folders):
        raise ValueError(f"Folder '{folder_id}' not found")
    config.watched_folders = filtered
    save_config(config)

def add_rule(config: AppConfig, folder_id: str, rule: Rule) -> None:
    for f in config.watched_folders:
        if f.id == folder_id:
            f.rules.append(rule)
            save_config(config)
            return
    raise ValueError(f"Folder '{folder_id}' not found")

def update_rule(config: AppConfig, folder_id: str, rule_id: str, updated_rule: Rule) -> None:
    for f in config.watched_folders:
        if f.id == folder_id:
            for i, r in enumerate(f.rules):
                if r.id == rule_id:
                    f.rules[i] = updated_rule
                    save_config(config)
                    return
            raise ValueError(f"Rule '{rule_id}' in folder '{folder_id}' not found")
    raise ValueError(f"Folder '{folder_id}' not found")

def remove_rule(config: AppConfig, folder_id: str, rule_id: str) -> None:
    for f in config.watched_folders:
        if f.id == folder_id:
            filtered = [r for r in f.rules if r.id != rule_id]
            if len(filtered) == len(f.rules):
                raise ValueError(f"Rule '{rule_id}' in folder '{folder_id}' not found")
            f.rules = filtered
            save_config(config)
            return
    raise ValueError(f"Folder '{folder_id}' not found")