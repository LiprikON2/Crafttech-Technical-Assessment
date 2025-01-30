import { ActionIcon, Dialog, SegmentedControl } from "@mantine/core";
import {
    IconCircle,
    IconHandStop,
    IconPointer,
    IconSquare,
    IconTriangle,
} from "@tabler/icons-react";

import classes from "./Toolbar.module.css";
import { isTool, Tool } from "~/App";

interface ToolbarProps {
    tool: Tool;
    setTool: (value: Tool) => void;
}

const data: { value: Tool; label: React.ReactNode }[] = [
    {
        value: "move-tool",
        label: (
            <ActionIcon size="lg" variant="transparent" component="span">
                <IconPointer style={{ width: "60%", height: "60%" }} stroke={1.5} />
            </ActionIcon>
        ),
    },
    {
        value: "rectangle",
        label: (
            <ActionIcon size="lg" variant="transparent" component="span">
                <IconSquare style={{ width: "60%", height: "60%" }} stroke={1.5} />
            </ActionIcon>
        ),
    },
    {
        value: "circle",
        label: (
            <ActionIcon size="lg" variant="transparent" component="span">
                <IconCircle style={{ width: "60%", height: "60%" }} stroke={1.5} />
            </ActionIcon>
        ),
    },
    {
        value: "triangle",
        label: (
            <ActionIcon size="lg" variant="transparent" component="span">
                <IconTriangle style={{ width: "60%", height: "60%" }} stroke={1.5} />
            </ActionIcon>
        ),
    },
    {
        value: "hand-tool",
        label: (
            <ActionIcon size="lg" variant="transparent" component="span">
                <IconHandStop style={{ width: "60%", height: "60%" }} stroke={1.5} />
            </ActionIcon>
        ),
    },
];

export const Toolbar = ({ tool, setTool }: ToolbarProps) => {
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
