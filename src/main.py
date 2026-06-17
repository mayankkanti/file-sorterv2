import typer
from core import Watcher

app = typer.Typer()

@app.callback()
def main():
    pass

@app.command()
def startwatcher():
    print("Starting watcher...")
    watcher = Watcher()
    watcher.run()

if __name__ == "__main__":
    app()