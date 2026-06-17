import logging
from pathlib import Path
from logging.handlers import TimedRotatingFileHandler

LOG_DIR = Path.home() / "AppData" / "Roaming" / "FileSorter" / "logs"

(LOG_DIR / "app").mkdir(parents=True, exist_ok=True)
(LOG_DIR / "watcher").mkdir(parents=True, exist_ok=True)

DEBUG = True

formatter = logging.Formatter(
    "%(asctime)s [%(name)s] %(levelname)s: %(message)s"
)

console_handler = logging.StreamHandler()
console_handler.setFormatter(formatter)


def create_logger(name: str, log_dir: Path) -> logging.Logger:
    logger = logging.getLogger(name)

    # Prevent duplicate handlers if imported multiple times
    if logger.handlers:
        return logger

    logger.setLevel(logging.INFO)

    file_handler = TimedRotatingFileHandler(
        filename=log_dir / f"{name.lower()}.log",
        when="midnight",
        interval=1,
        backupCount=7,
        encoding="utf-8",
        utc=False,
    )

    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)

    if DEBUG:
        logger.addHandler(console_handler)

    logger.propagate = False

    return logger


app_logger = create_logger(
    "APP",
    LOG_DIR / "app"
)

watcher_logger = create_logger(
    "WATCHER",
    LOG_DIR / "watcher"
)