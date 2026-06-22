use serde::{Deserialize, Serialize};
use std::collections::HashSet;
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppSettings {
    pub run_on_startup: bool,
    pub inactivity_seconds: i32,
    pub notifications: bool,
    pub log_retention_days: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Rule {
    pub id: String,

    #[serde(rename = "type")]
    pub rule_type: String,

    pub enabled: bool,
    pub destination: String,
    pub extensions: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FolderConfig {
    pub id: String,
    pub path: String,
    pub enabled: bool,
    pub recursive: bool,
    pub rules: Vec<Rule>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfig {
    pub version: String,
    pub app: AppSettings,
    pub watched_folders: Vec<FolderConfig>,
}

pub fn filesorter_dir() -> Result<PathBuf, String> {
    Ok(
        dirs::home_dir()
            .ok_or("Could not determine home directory")?
            .join("AppData")
            .join("Roaming")
            .join("FileSorter"),
    )
}

pub fn config_path() -> Result<PathBuf, String> {
    Ok(filesorter_dir()?.join("config.json"))
}

pub fn default_config() -> AppConfig {
    AppConfig {
        version: "1.0.0".to_string(),
        app: AppSettings {
            run_on_startup: true,
            inactivity_seconds: 300,
            notifications: true,
            log_retention_days: 10,
        },
        watched_folders: vec![],
    }
}

pub fn validate_config(config: &AppConfig) -> Vec<String> {
    let mut errors = Vec::new();

    if config.app.inactivity_seconds < 1 {
        errors.push("inactivity_seconds must be >= 1".to_string());
    }

    let mut folder_ids = HashSet::new();

    for folder in &config.watched_folders {
        if folder.path.trim().is_empty() {
            errors.push(format!(
                "Folder '{}' path must not be empty",
                folder.id
            ));
        }

        if !folder_ids.insert(folder.id.clone()) {
            errors.push(format!(
                "Duplicate folder id '{}'",
                folder.id
            ));
        }

        let mut rule_ids = HashSet::new();

        for rule in &folder.rules {
            if rule.destination.trim().is_empty() {
                errors.push(format!(
                    "Rule '{}' in folder '{}' has empty destination",
                    rule.id,
                    folder.id
                ));
            }

            if !rule_ids.insert(rule.id.clone()) {
                errors.push(format!(
                    "Duplicate rule id '{}' in folder '{}'",
                    rule.id,
                    folder.id
                ));
            }

            for ext in &rule.extensions {
                if !ext.starts_with('.') {
                    errors.push(format!(
                        "Extension '{}' in rule '{}' must start with '.'",
                        ext,
                        rule.id
                    ));
                }
            }
        }
    }

    errors
}

pub fn save_config(config: &AppConfig) -> Result<(), String> {
    let errors = validate_config(config);

    if !errors.is_empty() {
        return Err(errors.join("\n"));
    }

    let path = config_path()?;

    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)
            .map_err(|e| e.to_string())?;
    }

    let temp_path = path.with_extension("tmp");

    let json = serde_json::to_string_pretty(config)
        .map_err(|e| e.to_string())?;

    fs::write(&temp_path, json)
        .map_err(|e| e.to_string())?;

    fs::rename(temp_path, path)
        .map_err(|e| e.to_string())?;

    Ok(())
}

pub fn load_config() -> Result<AppConfig, String> {
    let path = config_path()?;

    if !path.exists() {
        let config = default_config();
        save_config(&config)?;
        return Ok(config);
    }

    let content = match fs::read_to_string(&path) {
        Ok(content) => content,
        Err(_) => {
            let config = default_config();
            save_config(&config)?;
            return Ok(config);
        }
    };

    match serde_json::from_str::<AppConfig>(&content) {
        Ok(config) => {
            let errors = validate_config(&config);

            if !errors.is_empty() {
                return Err(errors.join("\n"));
            }

            Ok(config)
        }

        Err(_) => {
            let backup_path = path.with_extension("corrupt");

            let _ = fs::remove_file(&backup_path);
            let _ = fs::rename(&path, backup_path);

            let config = default_config();

            save_config(&config)?;

            Ok(config)
        }
    }
}

#[tauri::command]
pub fn get_config() -> Result<String, String> {
    let config = load_config()?;

    serde_json::to_string(&config)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn save_config_command(
    config: AppConfig,
) -> Result<(), String> {
    save_config(&config)
}