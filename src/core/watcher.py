# rewrite counter: 2

from watchdog.observers import Observer
from watchdog.events import FileSystemEvent, FileSystemEventHandler
from threading import Event, Lock, Thread
from config import load_config, get_watcher_paths,FolderConfig, AppConfig
from pathlib import Path
from logger import watcher_logger
from core.sorter import Sorter
import time


class Watcher:

    class Handler(FileSystemEventHandler):

        def __init__(self, parent: "Watcher"):
            self.parent = parent

        def on_any_event(self, event: FileSystemEvent) -> None:
            if self.parent.paused.is_set():
                return

            watcher_logger.info(f"{event.event_type}: {event.src_path}")

            folder = Path(str(event.src_path)).parent

            with self.parent.activity_lock:
                self.parent.folder_activity[folder] = time.time()

    def __init__(self) -> None:

        self.config: AppConfig = load_config()
        self.watcher_paths: list[Path] = [
            Path(path)
            for path in get_watcher_paths(self.config)
            if Path(path).exists()
        ]

        self.INACTIVITY_TIME: int = max(1, self.config.app.inactivity_seconds)

        self.folder_activity: dict[Path, float] = {}
        self.activity_lock: Lock = Lock()

        self.paused: Event = Event()

        self.observer = Observer()
        self.handler = self.Handler(self)
        self._running: bool = False

    def run(self) -> None:
        self._running = True
        watcher_logger.info("Starting watcher...")
        for path in self.watcher_paths:
            self.observer.schedule(
                self.handler,
                str(path),
                recursive=False
            )
            watcher_logger.info(f"Watching {path}")

        self.observer.start()

        Thread(
            target=self.__inactivity_monitor,
            daemon=True
        ).start()

        try:
            self.observer.join()
        except KeyboardInterrupt:
            self.stop()

    def stop(self) -> None:
        watcher_logger.info("Stopping watcher...")
        self._running = False
        self.observer.stop()
        try:
            self.observer.join(timeout=2.0)
        except Exception as e:
            watcher_logger.error(f"Error joining observer: {e}")

    def __inactivity_monitor(self) -> None:
        while self._running:
            now = time.time()
            with self.activity_lock:
                inactive_folders = [
                    folder
                    for folder, last_activity
                    in self.folder_activity.items()
                    if now - last_activity >= self.INACTIVITY_TIME
                ]
            for folder in inactive_folders:
                watcher_logger.info(
                    f"Folder {folder} has been inactive for {self.INACTIVITY_TIME} seconds. Processing..."
                )
                self.__process_folder(folder)
            time.sleep(1)

    def __pause_watching(self) -> None:
        self.paused.set()

    def __resume_watching(self) -> None:
        self.paused.clear()

    def __process_folder(self, folder: Path) -> None:

        self.__pause_watching()
        try:
            watcher_logger.info(
                f"Processing {folder}"
            )
            with self.activity_lock:
                folder_config = self.__find_folder_config(folder)
                if folder_config is None:
                    return
                sorter = Sorter(folder_config=folder_config)
                sorter.start()
                self.folder_activity.pop(folder, None)

        finally:
            self.__resume_watching()
    def __find_folder_config(self, folder_path: Path | str) -> FolderConfig | None:
        folder_config: FolderConfig | None = None
        for config in self.config.watched_folders:
            config_path = Path(config.path)
            folder_path = Path(folder_path)
            if config_path == folder_path:
                folder_config = config
                break
        if folder_config is None:
            return
        return folder_config       
