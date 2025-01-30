import { useEffect, useState } from "react";
import { ColorInput, rem, Stack, Text } from "@mantine/core";

import { ContextMenu } from "~/components";
import { Shape, ShapeContextMenuState } from "../../Canvas";
import { UseListStateHandlers } from "@mantine/hooks";

interface ShapeContextMenuProps {
    contextMenu: ShapeContextMenuState;
    setContextMenu: (value: ShapeContextMenuState) => void;
    shapeHandlers: UseListStateHandlers<Shape>;
}

export const ShapeContextMenu = ({
    contextMenu,
    setContextMenu,
    shapeHandlers,
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
                    <Text tt="capitalize" size="sm" fw={700} style={{ lineHeight: 1 }}>
                        {contextMenu.shape.type}
                    </Text>
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
