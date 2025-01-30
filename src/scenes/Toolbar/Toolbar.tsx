import {
    ActionIcon,
    Dialog,
    HoverCard,
    SegmentedControl,
    Text,
    Group,
    Popover,
    rem,
    Kbd,
} from "@mantine/core";
import {
    IconCircle,
    IconHandStop,
    IconPointer,
    IconSquare,
    IconTriangle,
} from "@tabler/icons-react";

import classes from "./Toolbar.module.css";
import { isTool, Tool } from "~/App";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";

interface ToolbarProps {
    tool: Tool;
    setTool: (value: Tool) => void;
}

export const Toolbar = ({ tool, setTool }: ToolbarProps) => {
    const [openedPopover, setOpenedPopover] = useState<Tool | null>(null);

    const data: { value: Tool; label: React.ReactNode }[] = [
        {
            value: "move-tool",
            label: (
                <Popover
                    classNames={{ dropdown: classes.dropdown }}
                    position="right"
                    withArrow
                    shadow="md"
                    opened={openedPopover === "move-tool"}
                >
                    <Popover.Target>
                        <ActionIcon
                            onMouseEnter={() => setOpenedPopover("move-tool")}
                            onMouseLeave={() => setOpenedPopover(null)}
                            size="lg"
                            variant="transparent"
                            component="span"
                        >
                            <IconPointer style={{ width: "60%", height: "60%" }} stroke={1.5} />
                        </ActionIcon>
                    </Popover.Target>
                    <Popover.Dropdown style={{ pointerEvents: "none" }}>
                        <Text size="sm">
                            Move tool{" "}
                            <Kbd py={rem(2)} mx={rem(2)}>
                                V
                            </Kbd>
                        </Text>
                    </Popover.Dropdown>
                </Popover>
            ),
        },
        {
            value: "rectangle",
            label: (
                <Popover
                    classNames={{ dropdown: classes.dropdown }}
                    position="right"
                    withArrow
                    shadow="md"
                    opened={openedPopover === "rectangle"}
                >
                    <Popover.Target>
                        <ActionIcon
                            onMouseEnter={() => setOpenedPopover("rectangle")}
                            onMouseLeave={() => setOpenedPopover(null)}
                            size="lg"
                            variant="transparent"
                            component="span"
                        >
                            <IconSquare style={{ width: "60%", height: "60%" }} stroke={1.5} />
                        </ActionIcon>
                    </Popover.Target>
                    <Popover.Dropdown style={{ pointerEvents: "none" }}>
                        <Text size="sm">
                            Rectangle{" "}
                            <Kbd py={rem(2)} mx={rem(2)}>
                                R
                            </Kbd>
                        </Text>
                    </Popover.Dropdown>
                </Popover>
            ),
        },
        {
            value: "circle",
            label: (
                <Popover
                    classNames={{ dropdown: classes.dropdown }}
                    position="right"
                    withArrow
                    shadow="md"
                    opened={openedPopover === "circle"}
                >
                    <Popover.Target>
                        <ActionIcon
                            onMouseEnter={() => setOpenedPopover("circle")}
                            onMouseLeave={() => setOpenedPopover(null)}
                            size="lg"
                            variant="transparent"
                            component="span"
                        >
                            <IconCircle style={{ width: "60%", height: "60%" }} stroke={1.5} />
                        </ActionIcon>
                    </Popover.Target>
                    <Popover.Dropdown style={{ pointerEvents: "none" }}>
                        <Text size="sm">
                            Circle{" "}
                            <Kbd py={rem(2)} mx={rem(2)}>
                                C
                            </Kbd>
                        </Text>
                    </Popover.Dropdown>
                </Popover>
            ),
        },
        {
            value: "triangle",
            label: (
                <Popover
                    classNames={{ dropdown: classes.dropdown }}
                    position="right"
                    withArrow
                    shadow="md"
                    opened={openedPopover === "triangle"}
                >
                    <Popover.Target>
                        <ActionIcon
                            onMouseEnter={() => setOpenedPopover("triangle")}
                            onMouseLeave={() => setOpenedPopover(null)}
                            size="lg"
                            variant="transparent"
                            component="span"
                        >
                            <IconTriangle style={{ width: "60%", height: "60%" }} stroke={1.5} />
                        </ActionIcon>
                    </Popover.Target>
                    <Popover.Dropdown style={{ pointerEvents: "none" }}>
                        <Text size="sm">
                            Triangle{" "}
                            <Kbd py={rem(2)} mx={rem(2)}>
                                T
                            </Kbd>
                        </Text>
                    </Popover.Dropdown>
                </Popover>
            ),
        },
        {
            value: "hand-tool",
            label: (
                <Popover
                    classNames={{ dropdown: classes.dropdown }}
                    position="right"
                    withArrow
                    shadow="md"
                    opened={openedPopover === "hand-tool"}
                >
                    <Popover.Target>
                        <ActionIcon
                            onMouseEnter={() => setOpenedPopover("hand-tool")}
                            onMouseLeave={() => setOpenedPopover(null)}
                            size="lg"
                            variant="transparent"
                            component="span"
                        >
                            <IconHandStop style={{ width: "60%", height: "60%" }} stroke={1.5} />
                        </ActionIcon>
                    </Popover.Target>
                    <Popover.Dropdown style={{ pointerEvents: "none" }}>
                        <Text size="sm">
                            Hand tool{" "}
                            <Kbd py={rem(2)} mx={rem(2)}>
                                H
                            </Kbd>
                        </Text>
                    </Popover.Dropdown>
                </Popover>
            ),
        },
    ];

    return (
        <>
            <Dialog position={{ top: 20, left: 20 }} p={0} w="100%" opened>
                <SegmentedControl
                    classNames={{ label: classes.label }}
                    onChange={(tool) => {
                        if (isTool(tool)) setTool(tool);
                    }}
                    value={tool}
                    transitionDuration={100}
                    orientation="vertical"
                    withItemsBorders={false}
                    data={data}
                />
            </Dialog>
        </>
    );
};
