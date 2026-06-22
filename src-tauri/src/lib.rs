mod config;
mod logs;

use config::{
    get_config,
    save_config_command,
};

use logs::{
    get_app_logs,
    get_watcher_logs,
};

#[tauri::command]
fn test() -> String {
    "Waddup".to_string()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            test,
            get_config,
            save_config_command,
            get_app_logs,
            get_watcher_logs,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}