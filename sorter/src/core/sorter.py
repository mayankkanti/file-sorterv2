# rewrite counter: 3

from pathlib import Path
from sorter.src.config.models import FolderConfig
from typing import List, Set, Dict
from sorter.src.logger import app_logger
from shutil import move
import secrets, string

from win11toast import toast # type: ignore

class Sorter:
    def __init__(self, folder_config: FolderConfig):
        self.folder_config: FolderConfig = folder_config
        self.base_path: Path = Path(folder_config.path)
        self.rules = folder_config.rules
        self.all_files: List[str] = self.__get_files_in_path(self.base_path)
        self.extension_map: Dict[str, List[str]] = self.__map_files_by_extension()
        self.destination_map: Dict[str, List[str]]= self.__map_files_by_destination()
        self.no_of_files_to_sort: int = sum(len(files) for files in self.destination_map.values())
        self.no_of_files_sorted: int = 0
    
    @staticmethod
    def __get_files_in_path(path: str | Path) -> List[str]: 
        path_object : Path = Path(path)
        exclusion_list: Set[str] = {'desktop.ini', 'thumbs.db'}
        return [
            file.name
            for file in path_object.iterdir() 
            if file.is_file() and file.name not in exclusion_list
    ]

    def __verify_and_create_destination(self) -> None:
        for rule in self.rules:
            if rule.enabled:
                (self.base_path / rule.destination).mkdir(parents=True, exist_ok=True)
    
    def __map_files_by_extension(self) -> Dict[str, List[str]]:
        extension_map : Dict[str, List[str]]= {}
        for file in self.all_files:
            ext = Path(file).suffix.lower()
            if ext not in extension_map:
                extension_map[ext] = []
            extension_map[ext].append(file)
        return extension_map
    
    def __map_files_by_destination(self) -> Dict[str, List[str]]:
        destination_map: Dict[str, List[str]] = {}
        for rule in self.rules:
            if not rule.enabled:
                continue
            for ext in rule.extensions:
                ext = ext.lower()
                if ext not in self.extension_map:
                    continue

                if rule.destination not in destination_map:
                    destination_map[rule.destination] = []
                destination_map[rule.destination].extend(self.extension_map[ext])
        return destination_map
    
    def start(self) -> None:
        app_logger.info(f"Sort Operation Called for folder: {self.base_path}")
        app_logger.info(f"Rules: {self.rules}")
        try:
            app_logger.info("Verifying and creating destination folders.")
            self.__verify_and_create_destination()
        except:
            app_logger.error("Error Creating/Verifying Destination Folders.")

        if self.no_of_files_to_sort == 0:
            app_logger.info("No files to sort.")
            return
        

        for destination, files in self.destination_map.items():
            destination_dir: Path = self.base_path / destination

            for file in files:
                source_path: Path = self.base_path / file
                destination_path: Path = destination_dir / file

                while destination_path.exists():
                    app_logger.warning(f"File Already Exists. Possible Duplicates. Renaming File")
                    random_string = ''.join(
                        secrets.choice(string.ascii_lowercase + string.digits)
                        for _ in range(5)
                    )
                    new_name: str = (
                        f"{destination_path.stem}_{random_string}"
                        f"{destination_path.suffix}"
                    )
                    destination_path = destination_dir / new_name
                    
                try:
                    move(str(source_path), str(destination_path))
                    self.no_of_files_sorted += 1
                    app_logger.info(f"Moved file {file} to {destination}")
                except Exception as e:
                    app_logger.error(f"Errored while moving file {file} to {destination}")
                    app_logger.error(e)
        app_logger.info(f"Sorting Completed. {self.no_of_files_sorted}/{self.no_of_files_to_sort} files sorted.")
        toast("FileSorter", f"Sorting Completed. {self.no_of_files_sorted}/{self.no_of_files_to_sort} files sorted.")