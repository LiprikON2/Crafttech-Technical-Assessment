import Konva from "konva";
import { UseListStateHandlers } from "@mantine/hooks";

import { Shape } from "../../Canvas";
import { useCircleTool, useMoveTool, useRectangleTool, useTriangleTool } from "./hooks";

interface ToolHandler {
    drawingMarquee: Shape | null;
    setDrawingMarquee: (value: Shape | null) => void;
    setTargetHandles: (value: Shape | null) => void;

    shapes: Shape[];
    dragOrigin: Konva.Vector2d | null | null;
    setDragOrigin: (value: Konva.Vector2d | null) => void;
    target: string | null;
    setTarget: (value: string | null) => void;
    shapeHandlers: UseListStateHandlers<Shape>;
    targetHandles: Shape | null;
}

export const useToolHandlers = ({
    drawingMarquee,
    setDrawingMarquee,
    setTargetHandles,

    shapes,
    dragOrigin,
    setDragOrigin,
    target,
    setTarget,
    shapeHandlers,
    targetHandles,
}: ToolHandler) => {
    const moveToolHandler = useMoveTool({
        shapes,
        dragOrigin,
        setDragOrigin,
        shapeHandlers,
        target,
        setTarget,
        targetHandles,
        setTargetHandles,
    });

    const rectangleToolHandler = useRectangleTool({
        drawingMarquee,
        setDrawingMarquee,
        shapeHandlers,
        setTarget,
        setTargetHandles,
    });
    const circleToolHandler = useCircleTool({
        drawingMarquee,
        setDrawingMarquee,
        shapeHandlers,
        setTarget,
        setTargetHandles,
    });
    const triangleToolHandler = useTriangleTool({
        drawingMarquee,
        setDrawingMarquee,
        shapeHandlers,
        setTarget,
        setTargetHandles,
    });

    const toolHandlers = {
        "move-tool": moveToolHandler,
        rectangle: rectangleToolHandler,
        circle: circleToolHandler,
        triangle: triangleToolHandler,
        "hand-tool": {
            onMouseDown: () => {},
            onMouseUp: () => {},
            onMouseMove: () => {},
        },
    };
    return toolHandlers;
};
