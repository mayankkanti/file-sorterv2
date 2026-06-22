import {
  Card,
  Text,
} from "@mantine/core";

type Props = {
  label: string;
  value: string | number;
};

export default function Metric({
  label,
  value,
}: Props) {
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