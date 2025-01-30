import Konva from "konva";
import { useEffect, useRef, useState } from "react";

import { Tool } from "~/App";
import { useKeyHeld, useMouseButtonHeld } from "~/hooks";
import { MouseButtons, Shape } from "../Canvas";
import { useHotkeys } from "@mantine/hooks";

interface ToolEffects {
    stageRef: React.RefObject<Konva.Stage>;
    tool: Tool;
    setTool: (value: Tool) => void;
}

export const useToolEffects = ({ stageRef, tool, setTool }: ToolEffects) => {
    const [drawingMarquee, setDrawingMarquee] = useState<Shape | null>(null);
    const [targetHandles, setTargetHandles] = useState<Shape | null>(null);
    const [dragOrigin, setDragOrigin] = useState<Konva.Vector2d | null>(null);

    const [target, setTarget] = useState<string | null>(null);

    const switchCursor = (cursor: string) => {
        if (!stageRef.current) return;

        stageRef.current.container().style.cursor = cursor;
    };

    const prevToolRef = useRef<Tool | null>(null);

    /* Can pan stage while spacebar is held */
    useKeyHeld(
        {
            code: "Space",
            onDown: (e) => {
                if (!e.repeat) prevToolRef.current = tool;
                setTool("hand-tool");
            },
            onUp: () => {
                setTool(prevToolRef.current ?? "move-tool");
            },
        },
        [tool]
    );

    useHotkeys([
        [
            "V",
            () => {
                setTool("move-tool");
            },
        ],
        [
            "H",
            () => {
                setTool("hand-tool");
            },
        ],
        [
            "T",
            () => {
                setTool("triangle");
            },
        ],
        [
            "C",
            () => {
                setTool("circle");
            },
        ],
        [
            "R",
            () => {
                setTool("rectangle");
            },
        ],
    ]);
    /* Can pan stage while middle mouse button is held */
    useMouseButtonHeld(
        {
            button: MouseButtons.Middle,
            onDown: (e) => {
                e.preventDefault();
                prevToolRef.current = tool;
                setTool("hand-tool");
            },
            onUp: (e) => {
                e.preventDefault();
                setTool(prevToolRef.current ?? "move-tool");
            },
        },
        [tool]
    );

    useEffect(() => {
        setDrawingMarquee(null);
        setDragOrigin(null);
        Konva.dragButtons = [MouseButtons.Middle];

        switch (tool) {
            case "move-tool":
                switchCursor("default");
                break;
            case "rectangle":
                switchCursor("crosshair");
                break;
            case "triangle":
                switchCursor("crosshair");
                break;
            case "circle":
                switchCursor("crosshair");
                break;
            case "hand-tool":
                Konva.dragButtons = [MouseButtons.Left, MouseButtons.Middle, MouseButtons.Right];
                switchCursor("grab");
                break;
        }
    }, [tool]);

    return {
        target,
        setTarget,
        drawingMarquee,
        setDrawingMarquee,
        dragOrigin,
        setDragOrigin,
        targetHandles,
        setTargetHandles,
    };
};
