use std::fs;
use std::path::PathBuf;

fn filesorter_dir() -> Result<PathBuf, String> {
    Ok(
        dirs::home_dir()
            .ok_or("Could not determine home directory")?
            .join("AppData")
            .join("Roaming")
            .join("FileSorter"),
    )
}

fn app_log_path() -> Result<PathBuf, String> {
    Ok(
        filesorter_dir()?
            .join("logs")
            .join("app")
            .join("app.log"),
    )
}

fn watcher_log_path() -> Result<PathBuf, String> {
    Ok(
        filesorter_dir()?
            .join("logs")
            .join("watcher")
            .join("watcher.log"),
    )
}

fn tail(path: PathBuf, max_lines: usize) -> Result<String, String> {
    let content =
        fs::read_to_string(path).map_err(|e| e.to_string())?;

    let lines: Vec<&str> = content.lines().collect();

    let start = lines.len().saturating_sub(max_lines);

    Ok(lines[start..].join("\n"))
}

#[tauri::command]
pub fn get_app_logs() -> Result<String, String> {
    tail(app_log_path()?, 500)
}

#[tauri::command]
pub fn get_watcher_logs() -> Result<String, String> {
    tail(watcher_log_path()?, 500)
}