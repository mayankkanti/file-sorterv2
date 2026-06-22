import {
  Button,
  Divider,
  Group,
  Paper,
  Tabs,
} from "@mantine/core";

import { IconRefresh } from "@tabler/icons-react";
import LogBlock from "./LogBlock";

type Props = {
  logs: string[];
  onRefresh: () => Promise<void>;
};

export default function LogsTab({
  logs,
  onRefresh,
}: Props) {
  return (
    <Paper withBorder radius="md">
      <Tabs defaultValue="watcher">
        <Group justify="space-between" p="md">
          <Tabs.List>
            <Tabs.Tab value="watcher">
              Watcher
            </Tabs.Tab>

            <Tabs.Tab value="app">
              App
            </Tabs.Tab>
          </Tabs.List>

          <Button
            leftSection={<IconRefresh size={16} />}
            variant="light"
            onClick={onRefresh}
          >
            Refresh
          </Button>
        </Group>

        <Divider />

        <Tabs.Panel value="watcher">
          <LogBlock lines={logs.filter((x) => x.includes("[WATCHER]"))} />
        </Tabs.Panel>

        <Tabs.Panel value="app">
          <LogBlock
            lines={logs.filter((x) => x.includes("[APP]"))}
          />
        </Tabs.Panel>
      </Tabs>
    </Paper>
  );
}