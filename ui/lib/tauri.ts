import { invoke } from "@tauri-apps/api/core";
import type { AppConfig } from "../types/models";

export async function getConfig(): Promise<AppConfig> {
  const json = await invoke<string>("get_config");
  return JSON.parse(json);
}

export async function getlogs() {
  console.time("app_logs");
  const appLogs = await invoke<string>("get_app_logs");
  console.timeEnd("app_logs");

  console.time("watcher_logs");
  const watcherLogs = await invoke<string>("get_watcher_logs");
  console.timeEnd("watcher_logs");

  console.time("processing");

  const appLogsArray = appLogs
    .split("\n")
    .filter((s): s is string => !!s);

  const watcherLogsArray = watcherLogs
    .split("\n")
    .filter((s): s is string => !!s);

  const logs = appLogsArray.concat(watcherLogsArray);

  console.timeEnd("processing");

  return logs;
}

export async function saveConfig(
  config: AppConfig,
): Promise<void> {
  await invoke("save_config_command", {
    config,
  });
}