import {
  ActionIcon,
  Badge,
  Button,
  Divider,
  Group,
  Paper,
  ScrollArea,
  SimpleGrid,
  Stack,
  Switch,
  Table,
  TagsInput,
  Text,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";

import {
  IconFolderPlus,
  IconTrash,
} from "@tabler/icons-react";

import type {
  AppConfig,
  FolderConfig,
} from "../../types/models";

import FolderRow from "./FolderRow";

type Props = {
  config: AppConfig;
  selectedFolder: FolderConfig;
  selectedFolderId: string;
  setSelectedFolderId: (id: string) => void;
};

export default function FoldersTab({
  config,
  selectedFolder,
  selectedFolderId,
  setSelectedFolderId,
}: Props) {
  return (
    <SimpleGrid
      cols={{ base: 1, lg: 2 }}
      spacing="md"
    >
      <Paper withBorder radius="md">
        <Group justify="space-between" p="md">
          <Title order={4}>
            Watched folders
          </Title>

          <Tooltip label="Add folder">
            <ActionIcon
              variant="light"
              color="teal"
              size="lg"
            >
              <IconFolderPlus size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>

        <Divider />

        <Stack gap={0}>
          {config.watched_folders.map(
            (folder) => (
              <FolderRow
                key={folder.id}
                folder={folder}
                selected={
                  folder.id === selectedFolderId
                }
                onSelect={() =>
                  setSelectedFolderId(
                    folder.id,
                  )
                }
              />
            ),
          )}
        </Stack>
      </Paper>

      <Stack>
        <Paper
          withBorder
          radius="md"
          p="md"
        >
          <Group
            justify="space-between"
            align="flex-start"
          >
            <Stack gap={4}>
              <Title order={4}>
                Folder details
              </Title>

              <Text
                size="sm"
                c="dimmed"
              >
                These fields map directly
                to one FolderConfig.
              </Text>
            </Stack>

            <Group>
              <Switch
                checked={
                  selectedFolder.enabled
                }
                label="Enabled"
                readOnly
              />

              <Switch
                checked={
                  selectedFolder.recursive
                }
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
          <Group
            justify="space-between"
            p="md"
          >
            <Stack gap={2}>
              <Title order={4}>
                Rules for this folder
              </Title>

              <Text
                size="sm"
                c="dimmed"
              >
                Rules are nested under the
                selected folder.
              </Text>
            </Stack>

            <Button variant="light">
              Add Rule
            </Button>
          </Group>

          <Divider />

          <ScrollArea>
            <Table
              verticalSpacing="sm"
              striped
              highlightOnHover
            >
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>
                    Destination
                  </Table.Th>
                  <Table.Th>
                    Extensions
                  </Table.Th>
                  <Table.Th>Type</Table.Th>
                  <Table.Th />
                </Table.Tr>
              </Table.Thead>

              <Table.Tbody>
                {selectedFolder.rules.map(
                  (rule) => (
                    <Table.Tr
                      key={rule.id}
                    >
                      <Table.Td>
                        <Switch
                          checked={
                            rule.enabled
                          }
                          readOnly
                        />
                      </Table.Td>

                      <Table.Td>
                        <Text fw={600}>
                          {
                            rule.destination
                          }
                        </Text>
                      </Table.Td>

                      <Table.Td>
                        <TagsInput
                          value={
                            rule.extensions
                          }
                          readOnly
                        />
                      </Table.Td>

                      <Table.Td>
                        <Badge variant="light">
                          {rule.type}
                        </Badge>
                      </Table.Td>

                      <Table.Td>
                        <Group
                          gap="xs"
                          justify="flex-end"
                        >
                          <Button
                            size="xs"
                            variant="subtle"
                          >
                            Edit
                          </Button>

                          <Tooltip label="Delete rule">
                            <ActionIcon
                              color="red"
                              variant="subtle"
                            >
                              <IconTrash
                                size={16}
                              />
                            </ActionIcon>
                          </Tooltip>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ),
                )}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        </Paper>
      </Stack>
    </SimpleGrid>
  );
}