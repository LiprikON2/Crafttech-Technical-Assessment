import Konva from "konva";
import { UseListStateHandlers } from "@mantine/hooks";

import { createDrawingMarquee, createTargetHandles, Shape, ToolHandler } from "../Canvas";

interface RectangleToolHandler {
    drawingMarquee: Shape | null;
    setDrawingMarquee: (value: Shape | null) => void;
    setTarget: (value: string | null) => void;
    shapeHandlers: UseListStateHandlers<Shape>;
    setTargetHandles: (value: Shape | null) => void;
}

export const useRectangleTool = ({
    drawingMarquee,
    setDrawingMarquee,
    shapeHandlers,
    setTarget,
    setTargetHandles,
}: RectangleToolHandler) => {
    const toolHandler: ToolHandler = {
        // ref: https://github.com/konvajs/react-konva/issues/164#issuecomment-360837853
        onMouseDown: (e: Konva.KonvaEventObject<MouseEvent>, mousePos: Konva.Vector2d) => {
            setDrawingMarquee(createDrawingMarquee("rectangle", mousePos));
        },

        onMouseUp: (e: Konva.KonvaEventObject<MouseEvent>, mousePos: Konva.Vector2d) => {
            if (!drawingMarquee) return;
            const newShape: Shape = {
                type: "rectangle",
                props: {
                    x: drawingMarquee.props.x,
                    y: drawingMarquee.props.y,
                    uuid: crypto.randomUUID(),
                    width: drawingMarquee.props.width,
                    height: drawingMarquee.props.height,
                    fill: Konva.Util.getRandomColor(),
                    shadowBlur: 5,
                    cornerRadius: 5,
                    scaleX: drawingMarquee.props.scaleX,
                    scaleY: drawingMarquee.props.scaleY,
                },
            };
            shapeHandlers.append(newShape);
            setDrawingMarquee(null);

            setTarget(newShape.props.uuid);
            setTargetHandles(createTargetHandles(newShape));
        },

        onMouseMove: (e: Konva.KonvaEventObject<MouseEvent>, mousePos: Konva.Vector2d) => {
            if (!drawingMarquee) return;
            const newWidth = mousePos.x - drawingMarquee.props.x;
            const newHeight = mousePos.y - drawingMarquee.props.y;

            // ref: https://github.com/konvajs/konva/issues/374
            const scaleX = newWidth < 0 ? -1 : 1;
            const scaleY = newHeight < 0 ? -1 : 1;

            setDrawingMarquee({
                ...drawingMarquee,
                props: {
                    ...drawingMarquee.props,
                    width: Math.abs(newWidth),
                    height: Math.abs(newHeight),
                    scaleX,
                    scaleY,
                },
            });
        },
    };

    return toolHandler;
};
