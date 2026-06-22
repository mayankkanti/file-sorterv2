"use client";

import { useEffect, useMemo, useState } from "react";

import {
  AppShell,
  Badge,
  Button,
  Group,
  Stack,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";

import {
  IconBell,
  IconFolder,
  IconPlayerPlay,
  IconPlayerStop,
  IconSettings,
} from "@tabler/icons-react";

import type { AppConfig } from "../types/models";

import { getConfig, getlogs, saveConfig } from "../lib/tauri";

import DashboardTab from "../components/dashboard/DashboardTab";
import FoldersTab from "../components/folders/FoldersTab";
import LogsTab from "../components/logs/LogsTab";
import SettingsTab from "../components/settings/SettingsTab";

type Section =
  | "dashboard"
  | "folders"
  | "logs"
  | "settings";

const navItems = [
  {
    value: "dashboard" as const,
    label: "Dashboard",
    icon: IconPlayerPlay,
  },
  {
    value: "folders" as const,
    label: "Folders",
    icon: IconFolder,
  },
  {
    value: "logs" as const,
    label: "Logs",
    icon: IconBell,
  },
  {
    value: "settings" as const,
    label: "Settings",
    icon: IconSettings,
  },
];

export default function Home() {
  const [logs, setLogs] = useState<string[]>([]);
  const [config, setConfig] =
    useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);

  const [section, setSection] =
    useState<Section>("folders");

  const [selectedFolderId, setSelectedFolderId] =
    useState("");

  const refreshLogs = async () => {
    const newLogs = await getlogs();
    setLogs(newLogs);
  };

  const refreshConfig = async () => {
    const newConfig = await getConfig();
    setConfig(newConfig);
  };

  const handleSaveConfig = async (
    newConfig: AppConfig,
  ) => {
    await saveConfig(newConfig);
  };
  
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        await Promise.all([
          refreshConfig(),
          refreshLogs(),
        ]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  useEffect(() => {
    if (
      config &&
      config.watched_folders.length > 0 &&
      !selectedFolderId
    ) {
      setSelectedFolderId(
        config.watched_folders[0].id,
      );
    }
  }, [config, selectedFolderId]);

  const selectedFolder = useMemo(() => {
    if (!config) {
      return undefined;
    }

    return (
      config.watched_folders.find(
        (folder) =>
          folder.id === selectedFolderId,
      ) ?? config.watched_folders[0]
    );
  }, [config, selectedFolderId]);

  const activeRuleCount = useMemo(
    () =>
      config?.watched_folders.reduce(
        (count, folder) =>
          count +
          folder.rules.filter(
            (rule) =>
              folder.enabled &&
              rule.enabled,
          ).length,
        0,
      ) ?? 0,
    [config],
  );

  const currentSection = useMemo(() => {
    if (!config) {
      return null;
    }

    switch (section) {
      case "dashboard":
        return (
          <DashboardTab
            config={config}
            activeRuleCount={
              activeRuleCount
            }
          />
        );

      case "folders":
        return selectedFolder ? (
          <FoldersTab
            config={config}
            selectedFolder={
              selectedFolder
            }
            selectedFolderId={
              selectedFolderId
            }
            setSelectedFolderId={
              setSelectedFolderId
            }
          />
        ) : null;

      case "logs":
        return <LogsTab logs={logs} onRefresh={refreshLogs} />;

      case "settings":
        return (
          <SettingsTab
            config={config}
            onConfigChange={
              handleSaveConfig
            }
            onSave={
              handleSaveConfig
            }
          />
        );

      default:
        return null;
    }
  }, [
    section,
    config,
    logs,
    selectedFolder,
    selectedFolderId,
    activeRuleCount,
  ]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!config) {
    return <div>Failed to load config</div>;
  }

  return (
    <AppShell
      header={{ height: 68 }}
      navbar={{
        width: 260,
        breakpoint: "sm",
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group
          h="100%"
          px="md"
          justify="space-between"
        >
          <Stack gap={0}>
            <Title order={3}>
              FileSorter
            </Title>

            <Text
              size="sm"
              c="dimmed"
            >
              Config manager and watcher
              console
            </Text>
          </Stack>

          <Group>
            <Badge
              color="green"
              variant="light"
              size="lg"
            >
              Idle
            </Badge>

            <Button
              leftSection={
                <IconPlayerPlay
                  size={16}
                />
              }
            >
              Start
            </Button>

            <Button
              color="gray"
              variant="light"
              leftSection={
                <IconPlayerStop
                  size={16}
                />
              }
            >
              Stop
            </Button>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Stack gap="xs">
          {navItems.map(
            ({
              value,
              label,
              icon: Icon,
            }) => (
              <Tooltip
                key={value}
                label={label}
                position="right"
              >
                <div>
                  <Button
                    fullWidth
                    justify="flex-start"
                    leftSection={
                      <Icon size={18} />
                    }
                    variant={
                      section === value
                        ? "light"
                        : "subtle"
                    }
                    color={
                      section === value
                        ? "teal"
                        : "gray"
                    }
                    onClick={() =>
                      setSection(value)
                    }
                  >
                    {label}
                  </Button>
                </div>
              </Tooltip>
            ),
          )}
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>
        {currentSection}
      </AppShell.Main>
    </AppShell>
  );
}