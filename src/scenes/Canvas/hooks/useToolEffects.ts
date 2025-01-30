import Konva from "konva";
import { useEffect, useRef, useState } from "react";

import { Tool } from "~/App";
import { useKeyHeld, useMouseButtonHeld } from "~/hooks";

export const useToolEffects = (stageRef: any, tool: Tool, setTool: (value: Tool) => void) => {
    const [isDrawing, setIsDrawing] = useState(false);

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
    /* Can pan stage while middle mouse button is held */
    useMouseButtonHeld(
        {
            button: 1,
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
        setIsDrawing(false);
        Konva.dragButtons = [1]; // Middle mouse button to pan stage

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
                Konva.dragButtons = [0, 1, 2]; // Left, middle, right mouse buttons to pan stage
                switchCursor("grab");
                break;
        }
    }, [tool]);

    return { isDrawing, setIsDrawing };
};
