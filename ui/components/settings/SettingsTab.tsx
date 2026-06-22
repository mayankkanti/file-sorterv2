import {
  Button,
  Group,
  NumberInput,
  Paper,
  SimpleGrid,
  Stack,
  Switch,
  Title,
} from "@mantine/core";

import { IconDeviceFloppy } from "@tabler/icons-react";

import type { AppConfig } from "../../types/models";

type Props = {
  config: AppConfig;
  onConfigChange: (config: AppConfig) => void;
  onSave: (config: AppConfig) => Promise<void>;
};

export default function SettingsTab({
  config,
  onConfigChange,
  onSave,
}: Props) {
  return (
    <Paper withBorder radius="md" p="md">
      <Stack>
        <Group justify="space-between">
          <Title order={4}>
            App settings
          </Title>

          <Button
            leftSection={
              <IconDeviceFloppy size={16} />
            }
            onClick={async () => {
              await onSave(config);
            }}
          >
            Save
          </Button>
        </Group>

        <SimpleGrid
          cols={{ base: 1, sm: 2 }}
        >
          <NumberInput
            label="Inactivity seconds"
            min={1}
            value={
              config.app.inactivity_seconds
            }
            onChange={(value) =>
              onConfigChange({
                ...config,
                app: {
                  ...config.app,
                  inactivity_seconds:
                    Number(value),
                },
              })
            }
          />

          <NumberInput
            label="Log retention days"
            min={1}
            value={
              config.app.log_retention_days
            }
            onChange={(value) =>
              onConfigChange({
                ...config,
                app: {
                  ...config.app,
                  log_retention_days:
                    Number(value),
                },
              })
            }
          />
        </SimpleGrid>

        <Group>
          <Switch
            checked={
              config.app.notifications
            }
            label="Notifications"
            onChange={(event) =>
              onConfigChange({
                ...config,
                app: {
                  ...config.app,
                  notifications:
                    event.currentTarget.checked,
                },
              })
            }
          />

          <Switch
            checked={
              config.app.run_on_startup
            }
            label="Run on startup"
            onChange={(event) =>
              onConfigChange({
                ...config,
                app: {
                  ...config.app,
                  run_on_startup:
                    event.currentTarget.checked,
                },
              })
            }
          />
        </Group>
      </Stack>
    </Paper>
  );
}