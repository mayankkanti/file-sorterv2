import { Code, ScrollArea } from "@mantine/core";

type Props = {
  lines: string[];
};

export default function LogBlock({ lines }: Props) {
  return (
    <ScrollArea h={360}>
      <Code
        block
        p="md"
        style={{
          whiteSpace: "pre",
        }}
      >
        {lines.length > 0
          ? lines.join("\n")
          : "No log lines to show."}
      </Code>
    </ScrollArea>
  );
}