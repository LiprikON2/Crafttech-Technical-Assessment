import Konva from "konva";
import { UseListStateHandlers } from "@mantine/hooks";

import {
    createDrawingMarquee,
    createTargetHandles,
    MouseButtons,
    Shape,
    ToolHandler,
} from "../../../Canvas";

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
        onPointerDown: (e, mousePos) => {
            if (e.evt.button !== MouseButtons.Left) return;

            setDrawingMarquee(createDrawingMarquee("rectangle", mousePos));
        },

        onPointerUp: (e, mousePos) => {
            if (e.evt.button !== MouseButtons.Left) return;

            if (
                !drawingMarquee ||
                drawingMarquee.shapeProps.width === 0 ||
                drawingMarquee.shapeProps.height === 0
            ) {
                setDrawingMarquee(null);
                return;
            }

            const newShape: Shape = {
                type: "rectangle",
                commonProps: {
                    x: drawingMarquee.commonProps.x,
                    y: drawingMarquee.commonProps.y,
                    uuid: crypto.randomUUID(),
                    shadowBlur: 5,
                    fill: Konva.Util.getRandomColor(),
                },
                shapeProps: {
                    width: drawingMarquee.shapeProps.width,
                    height: drawingMarquee.shapeProps.height,
                    scaleX: drawingMarquee.shapeProps.scaleX,
                    scaleY: drawingMarquee.shapeProps.scaleY,
                    cornerRadius: 5,
                },
            };
            shapeHandlers.append(newShape);
            setDrawingMarquee(null);

            setTarget(newShape.commonProps.uuid);
            setTargetHandles(createTargetHandles(newShape));
        },

        onPointerMove: (e, mousePos) => {
            if (!drawingMarquee) return;
            const newWidth = mousePos.x - drawingMarquee.commonProps.x;
            const newHeight = mousePos.y - drawingMarquee.commonProps.y;

            // ref: https://github.com/konvajs/konva/issues/374
            const scaleX = newWidth < 0 ? -1 : 1;
            const scaleY = newHeight < 0 ? -1 : 1;

            setDrawingMarquee({
                ...drawingMarquee,
                shapeProps: {
                    ...drawingMarquee.shapeProps,
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
