export type AppSettings = {
  run_on_startup: boolean;
  inactivity_seconds: number;
  notifications: boolean;
  log_retention_days: number;
};

export type Rule = {
  id: string;
  type: "extension";
  enabled: boolean;
  destination: string;
  extensions: string[];
};

export type FolderConfig = {
  id: string;
  path: string;
  enabled: boolean;
  recursive: boolean;
  rules: Rule[];
};

export type AppConfig = {
  version: string;
  app: AppSettings;
  watched_folders: FolderConfig[];
};