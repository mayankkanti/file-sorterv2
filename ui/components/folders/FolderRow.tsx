import {
  Badge,
  Group,
  Paper,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";

import { IconFolder } from "@tabler/icons-react";

import type { FolderConfig } from "../../types/models";

type Props = {
  folder: FolderConfig;
  selected: boolean;
  onSelect: () => void;
};

export default function FolderRow({
  folder,
  selected,
  onSelect,
}: Props) {
  return (
    <Paper
      component="button"
      onClick={onSelect}
      p="md"
      radius={0}
      style={{
        border: 0,
        borderLeft: selected
          ? "4px solid var(--mantine-color-teal-6)"
          : "4px solid transparent",
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

        <Badge
          color={folder.enabled ? "green" : "gray"}
          variant="light"
        >
          {folder.enabled ? "On" : "Off"}
        </Badge>
      </Group>
    </Paper>
  );
}