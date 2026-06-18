"use client";

import { useMemo, useState } from "react";
import {
  ActionIcon,
  AppShell,
  Badge,
  Button,
  Card,
  Code,
  Divider,
  Group,
  NumberInput,
  Paper,
  ScrollArea,
  SimpleGrid,
  Stack,
  Switch,
  Table,
  Tabs,
  TagsInput,
  Text,
  TextInput,
  ThemeIcon,
  Title,
  Tooltip,
} from "@mantine/core";
import {
  IconBell,
  IconDeviceFloppy,
  IconFolder,
  IconFolderPlus,
  IconPlayerPlay,
  IconPlayerStop,
  IconRefresh,
  IconSettings,
  IconTrash,
} from "@tabler/icons-react";

type Rule = {
  id: string;
  type: "extension";
  enabled: boolean;
  destination: string;
  extensions: string[];
};

type FolderConfig = {
  id: string;
  path: string;
  enabled: boolean;
  recursive: boolean;
  rules: Rule[];
};

type AppConfig = {
  version: string;
  app: {
    run_on_startup: boolean;
    inactivity_seconds: number;
    notifications: boolean;
    log_retention_days: number;
  };
  watched_folders: FolderConfig[];
};

const config: AppConfig = {
  version: "1.0.0",
  app: {
    run_on_startup: true,
    inactivity_seconds: 300,
    notifications: true,
    log_retention_days: 10,
  },
  watched_folders: [
    {
      id: "downloads",
      path: "C:\\Users\\inser\\Downloads",
      enabled: true,
      recursive: false,
      rules: [
        {
          id: "images",
          type: "extension",
          enabled: true,
          destination: "Images",
          extensions: [".jpg", ".jpeg", ".png", ".webp"],
        },
        {
          id: "documents",
          type: "extension",
          enabled: true,
          destination: "Documents",
          extensions: [".pdf", ".docx", ".txt"],
        },
      ],
    },
    {
      id: "desktop-inbox",
      path: "C:\\Users\\inser\\Desktop\\Inbox",
      enabled: false,
      recursive: false,
      rules: [
        {
          id: "archives",
          type: "extension",
          enabled: true,
          destination: "Archives",
          extensions: [".zip", ".rar", ".7z"],
        },
      ],
    },
  ],
};

const logs = [
  "2026-06-17 14:44:20 [WATCHER] INFO: Starting watcher...",
  "2026-06-17 14:44:20 [WATCHER] INFO: Watching C:\\Users\\inser\\Downloads",
  "2026-06-17 14:47:05 [APP] INFO: No files to sort.",
];

const navItems = [
  { value: "dashboard", label: "Dashboard", icon: IconPlayerPlay },
  { value: "folders", label: "Folders", icon: IconFolder },
  { value: "logs", label: "Logs", icon: IconBell },
  { value: "settings", label: "Settings", icon: IconSettings },
];

export default function Home() {
  const [section, setSection] = useState("folders");
  const [selectedFolderId, setSelectedFolderId] = useState(
    config.watched_folders[0]?.id ?? "",
  );

  const selectedFolder = useMemo(
    () =>
      config.watched_folders.find((folder) => folder.id === selectedFolderId) ??
      config.watched_folders[0],
    [selectedFolderId],
  );

  const activeRuleCount = config.watched_folders.reduce(
    (count, folder) =>
      count + folder.rules.filter((rule) => folder.enabled && rule.enabled).length,
    0,
  );

  return (
    <AppShell
      header={{ height: 68 }}
      navbar={{ width: 260, breakpoint: "sm" }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Stack gap={0}>
            <Title order={3}>FileSorter</Title>
            <Text size="sm" c="dimmed">
              Config manager and watcher console
            </Text>
          </Stack>
          <Group>
            <Badge color="green" variant="light" size="lg">
              Idle
            </Badge>
            <Button leftSection={<IconPlayerPlay size={16} />}>Start</Button>
            <Button
              leftSection={<IconPlayerStop size={16} />}
              color="gray"
              variant="light"
            >
              Stop
            </Button>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Stack gap="xs">
          {navItems.map((item) => (
            <item.icon key={`${item.value}-icon-cache`} size={0} display="none" />
          ))}
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Tooltip label={item.label} key={item.value} position="right">
                <div>
                  <Button
                    fullWidth
                    justify="flex-start"
                    leftSection={<Icon size={18} />}
                    variant={section === item.value ? "light" : "subtle"}
                    color={section === item.value ? "teal" : "gray"}
                    onClick={() => setSection(item.value)}
                  >
                    {item.label}
                  </Button>
                </div>
              </Tooltip>
            );
          })}
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>
        {section === "dashboard" && (
          <Stack>
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
              <Metric label="Watched folders" value={config.watched_folders.length} />
              <Metric label="Active rules" value={activeRuleCount} />
              <Metric label="Inactivity" value={`${config.app.inactivity_seconds}s`} />
              <Metric label="Log retention" value={`${config.app.log_retention_days}d`} />
            </SimpleGrid>
            <Paper withBorder p="md" radius="md">
              <Stack gap="xs">
                <Title order={4}>Current config shape</Title>
                <Text size="sm" c="dimmed">
                  Each watched folder owns its own enabled state, recursion setting,
                  and extension rules.
                </Text>
                <Code block>{JSON.stringify(config, null, 2)}</Code>
              </Stack>
            </Paper>
          </Stack>
        )}

        {section === "folders" && selectedFolder && (
          <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
            <div>
              <Paper withBorder radius="md">
                <Group justify="space-between" p="md">
                  <Title order={4}>Watched folders</Title>
                  <Tooltip label="Add folder">
                    <ActionIcon variant="light" color="teal" size="lg">
                      <IconFolderPlus size={18} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
                <Divider />
                <Stack gap={0}>
                  {config.watched_folders.map((folder) => (
                    <FolderRow
                      folder={folder}
                      key={folder.id}
                      selected={folder.id === selectedFolder.id}
                      onSelect={() => setSelectedFolderId(folder.id)}
                    />
                  ))}
                </Stack>
              </Paper>
            </div>

            <div>
              <Stack>
                <Paper withBorder radius="md" p="md">
                  <Group justify="space-between" align="flex-start">
                    <Stack gap={4}>
                      <Title order={4}>Folder details</Title>
                      <Text size="sm" c="dimmed">
                        These fields map directly to one `FolderConfig`.
                      </Text>
                    </Stack>
                    <Group>
                      <Switch
                        checked={selectedFolder.enabled}
                        label="Enabled"
                        readOnly
                      />
                      <Switch
                        checked={selectedFolder.recursive}
                        label="Recursive"
                        readOnly
                      />
                    </Group>
                  </Group>
                  <TextInput
                    mt="md"
                    label="Path"
                    value={selectedFolder.path}
                    readOnly
                  />
                </Paper>

                <Paper withBorder radius="md">
                  <Group justify="space-between" p="md">
                    <Stack gap={2}>
                      <Title order={4}>Rules for this folder</Title>
                      <Text size="sm" c="dimmed">
                        Rules are nested under the selected folder, not global.
                      </Text>
                    </Stack>
                    <Button variant="light">Add Rule</Button>
                  </Group>
                  <Divider />
                  <ScrollArea>
                    <Table verticalSpacing="sm" striped highlightOnHover>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>Status</Table.Th>
                          <Table.Th>Destination</Table.Th>
                          <Table.Th>Extensions</Table.Th>
                          <Table.Th>Type</Table.Th>
                          <Table.Th />
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {selectedFolder.rules.map((rule) => (
                          <Table.Tr key={rule.id}>
                            <Table.Td>
                              <Switch checked={rule.enabled} readOnly />
                            </Table.Td>
                            <Table.Td>
                              <Text fw={600}>{rule.destination}</Text>
                            </Table.Td>
                            <Table.Td>
                              <TagsInput value={rule.extensions} readOnly />
                            </Table.Td>
                            <Table.Td>
                              <Badge variant="light">{rule.type}</Badge>
                            </Table.Td>
                            <Table.Td>
                              <Group gap="xs" justify="flex-end">
                                <Button size="xs" variant="subtle">
                                  Edit
                                </Button>
                                <Tooltip label="Delete rule">
                                  <ActionIcon color="red" variant="subtle">
                                    <IconTrash size={16} />
                                  </ActionIcon>
                                </Tooltip>
                              </Group>
                            </Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  </ScrollArea>
                </Paper>
              </Stack>
            </div>
          </SimpleGrid>
        )}

        {section === "logs" && (
          <Paper withBorder radius="md">
            <Tabs defaultValue="watcher">
              <Group justify="space-between" p="md">
                <Tabs.List>
                  <Tabs.Tab value="watcher">Watcher</Tabs.Tab>
                  <Tabs.Tab value="app">App</Tabs.Tab>
                </Tabs.List>
                <Button leftSection={<IconRefresh size={16} />} variant="light">
                  Refresh
                </Button>
              </Group>
              <Divider />
              <Tabs.Panel value="watcher">
                <LogBlock lines={logs} />
              </Tabs.Panel>
              <Tabs.Panel value="app">
                <LogBlock lines={logs.filter((line) => line.includes("[APP]"))} />
              </Tabs.Panel>
            </Tabs>
          </Paper>
        )}

        {section === "settings" && (
          <Paper withBorder radius="md" p="md">
            <Stack>
              <Group justify="space-between">
                <Title order={4}>App settings</Title>
                <Button leftSection={<IconDeviceFloppy size={16} />}>Save</Button>
              </Group>
              <SimpleGrid cols={{ base: 1, sm: 2 }}>
                <NumberInput
                  label="Inactivity seconds"
                  min={1}
                  value={config.app.inactivity_seconds}
                />
                <NumberInput
                  label="Log retention days"
                  min={1}
                  value={config.app.log_retention_days}
                />
              </SimpleGrid>
              <Group>
                <Switch
                  checked={config.app.notifications}
                  label="Notifications"
                  readOnly
                />
                <Switch
                  checked={config.app.run_on_startup}
                  label="Run on startup"
                  readOnly
                />
              </Group>
            </Stack>
          </Paper>
        )}
      </AppShell.Main>
    </AppShell>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <Card withBorder radius="md" p="md">
      <Text size="sm" c="dimmed">
        {label}
      </Text>
      <Text mt={4} fw={700} size="xl">
        {value}
      </Text>
    </Card>
  );
}

function FolderRow({
  folder,
  selected,
  onSelect,
}: {
  folder: FolderConfig;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <Paper
      component="button"
      onClick={onSelect}
      p="md"
      radius={0}
      style={{
        border: 0,
        borderLeft: selected ? "4px solid var(--mantine-color-teal-6)" : "4px solid transparent",
        cursor: "pointer",
        textAlign: "left",
        width: "100%",
      }}
    >
      <Group justify="space-between" wrap="nowrap">
        <Group wrap="nowrap">
          <ThemeIcon
            color={folder.enabled ? "teal" : "gray"}
            variant="light"
            size="lg"
          >
            <IconFolder size={18} />
          </ThemeIcon>
          <Stack gap={2}>
            <Text size="sm" fw={600} truncate="end">
              {folder.path}
            </Text>
            <Text size="xs" c="dimmed">
              {folder.rules.length} rules
            </Text>
          </Stack>
        </Group>
        <Badge color={folder.enabled ? "green" : "gray"} variant="light">
          {folder.enabled ? "On" : "Off"}
        </Badge>
      </Group>
    </Paper>
  );
}

function LogBlock({ lines }: { lines: string[] }) {
  return (
    <ScrollArea h={360}>
      <Code block p="md">
        {lines.length > 0 ? lines.join("\n") : "No log lines to show."}
      </Code>
    </ScrollArea>
  );
}
