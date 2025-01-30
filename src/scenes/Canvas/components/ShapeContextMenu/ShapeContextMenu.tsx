import { useEffect, useState } from "react";
import { ActionIcon, ColorInput, Group, rem, Stack, Text } from "@mantine/core";
import { UseListStateHandlers } from "@mantine/hooks";

import { ContextMenu } from "~/components";
import { Shape, ShapeContextMenuState } from "../../Canvas";
import { IconTrash } from "@tabler/icons-react";

interface ShapeContextMenuProps {
    contextMenu: ShapeContextMenuState;
    shapeHandlers: UseListStateHandlers<Shape>;
    removeShape: () => void;
}

export const ShapeContextMenu = ({
    contextMenu,
    shapeHandlers,
    removeShape,
}: ShapeContextMenuProps) => {
    const [contextFill, setContextFill] = useState<string>();

    useEffect(() => {
        if (contextMenu.shape !== null)
            setContextFill(contextMenu.shape.commonProps.fill as string);
    }, [contextMenu]);

    return (
        <ContextMenu x={contextMenu.x} y={contextMenu.y} visible={contextMenu.shape !== null}>
            {contextMenu.shape && (
                <Stack p={rem(4)} gap="xs">
                    <Group justify="space-between">
                        <Text tt="capitalize" size="sm" fw={700} style={{ lineHeight: 1 }}>
                            {contextMenu.shape.type}
                        </Text>
                        <ActionIcon
                            onClick={removeShape}
                            color="red"
                            p={0}
                            size="lg"
                            variant="transparent"
                        >
                            <IconTrash style={{ width: "60%", height: "60%" }} stroke={1.5} />
                        </ActionIcon>
                    </Group>
                    <ColorInput
                        styles={{ eyeDropperButton: { padding: 0 } }}
                        value={contextFill}
                        onChange={(value) => {
                            if (contextMenu.shape === null || contextMenu.shapeIndex === null)
                                return;

                            shapeHandlers.setItemProp(contextMenu.shapeIndex, "commonProps", {
                                ...contextMenu.shape.commonProps,
                                fill: value,
                            });
                            setContextFill(value);
                        }}
                        swatches={[
                            "#2e2e2e",
                            "#868e96",
                            "#fa5252",
                            "#e64980",
                            "#be4bdb",
                            "#7950f2",
                            "#4c6ef5",
                            "#228be6",
                            "#15aabf",
                            "#12b886",
                            "#40c057",
                            "#82c91e",
                            "#fab005",
                            "#fd7e14",
                        ]}
                        closeOnColorSwatchClick
                    />
                </Stack>
            )}
        </ContextMenu>
    );
};
