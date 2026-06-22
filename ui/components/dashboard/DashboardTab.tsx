import { SimpleGrid, Stack } from "@mantine/core";
import Metric from "./Metric";
import type { AppConfig } from "../../types/models";

type Props = {
  config: AppConfig;
  activeRuleCount: number;
};

export default function DashboardTab({
  config,
  activeRuleCount,
}: Props) {
  return (
    <Stack>
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
        <Metric
          label="Watched folders"
          value={config.watched_folders.length}
        />

        <Metric
          label="Active rules"
          value={activeRuleCount}
        />

        <Metric
          label="Inactivity"
          value={`${config.app.inactivity_seconds}s`}
        />

        <Metric
          label="Log retention"
          value={`${config.app.log_retention_days}d`}
        />
      </SimpleGrid>
    </Stack>
  );
}