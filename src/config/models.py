from dataclasses import dataclass, field
from typing import Literal

@dataclass
class AppSettings:
    run_on_startup: bool = True
    inactivity_seconds: int = 300
    notifications: bool = True
    log_retention_days: int = 10

@dataclass
class Rule:
    id: str
    type: Literal["extension"]
    enabled: bool
    destination: str
    extensions: list[str] = field(default_factory=list) # type: ignore

@dataclass
class FolderConfig:
    id: str
    path: str
    enabled: bool
    recursive: bool
    rules: list[Rule]

@dataclass
class AppConfig:
    version: str
    app: AppSettings
    watched_folders: list[FolderConfig]