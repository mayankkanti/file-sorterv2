import typer
import json
from pathlib import Path

from core import Watcher
from config import load_config, save_config,from_dict, to_dict, get_config_path, get_log_paths, get_watcher_paths # type: ignore
from config import FolderConfig, AppConfig # type: ignore
from logger import read_app_log, read_watcher_log # type: ignore


app = typer.Typer()

@app.callback()
def main():
    pass

@app.command()
def watch():
    print("Starting watcher...")
    watcher = Watcher()
    watcher.run()

@app.command()
def getconfig():
    config = load_config()
    typer.echo(json.dumps(to_dict(config), indent=2))

@app.command()
def saveconfig(config_file: str) -> None:
    if not Path(config_file).exists():
        typer.echo(f"Config file '{config_file}' does not exist.")
        raise typer.Exit(code=1)
    data = json.loads(Path(config_file).read_text(encoding="utf-8"))
    config = from_dict(data)
    save_config(config)
    typer.echo("Config saved successfully.")

@app.command()
def getconfigpath() -> None:
    typer.echo(str(get_config_path()))

@app.command()
def getlogpaths() -> None:
    paths = [str(path) for path in get_log_paths()]
    typer.echo(json.dumps(paths))

@app.command()
def applogs() -> None:
    logs = read_app_log()
    if not logs:
        typer.echo("No Logs found.")
        raise typer.Exit(code=0)
    typer.echo(logs)

@app.command()  
def watcherlogs() -> None:
    logs = read_watcher_log()
    if not logs:
        typer.echo("No Logs found.")
        raise typer.Exit(code=0)
    typer.echo(logs)
    
if __name__ == "__main__":
    app()