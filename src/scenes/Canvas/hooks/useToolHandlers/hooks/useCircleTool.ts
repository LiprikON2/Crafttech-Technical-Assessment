import Konva from "konva";
import { UseListStateHandlers } from "@mantine/hooks";

import {
    createDrawingMarquee,
    createTargetHandles,
    MouseButtons,
    Shape,
    ToolHandler,
} from "../../../Canvas";

interface CircleToolHandler {
    drawingMarquee: Shape | null;
    setDrawingMarquee: (value: Shape | null) => void;
    setTarget: (value: string | null) => void;
    shapeHandlers: UseListStateHandlers<Shape>;
    setTargetHandles: (value: Shape | null) => void;
}

export const useCircleTool = ({
    drawingMarquee,
    setDrawingMarquee,
    shapeHandlers,
    setTarget,
    setTargetHandles,
}: CircleToolHandler) => {
    const toolHandler: ToolHandler = {
        // ref: https://github.com/konvajs/react-konva/issues/164#issuecomment-360837853
        onMouseDown: (e, mousePos) => {
            if (e.evt.button !== MouseButtons.Left) return;

            setDrawingMarquee(createDrawingMarquee("circle", mousePos));
        },

        onMouseUp: (e, mousePos) => {
            if (e.evt.button !== MouseButtons.Left) return;

            if (!drawingMarquee || drawingMarquee.shapeProps.radius === 0) {
                setDrawingMarquee(null);
                return;
            }

            const newShape: Shape = {
                type: "circle",
                commonProps: {
                    x: drawingMarquee.commonProps.x,
                    y: drawingMarquee.commonProps.y,
                    uuid: crypto.randomUUID(),
                    fill: Konva.Util.getRandomColor(),
                    shadowBlur: 5,
                },
                shapeProps: {
                    radius: drawingMarquee.shapeProps.radius,
                },
            };

            shapeHandlers.append(newShape);
            setDrawingMarquee(null);

            setTarget(newShape.commonProps.uuid);
            setTargetHandles(createTargetHandles(newShape));
        },

        onMouseMove: (e, mousePos) => {
            if (!drawingMarquee) return;
            const deltaX = mousePos.x - drawingMarquee.commonProps.x;
            const deltaY = mousePos.y - drawingMarquee.commonProps.y;

            const newRadius = Math.sqrt(deltaX ** 2 + deltaY ** 2);

            setDrawingMarquee({
                ...drawingMarquee,
                shapeProps: {
                    ...drawingMarquee.shapeProps,
                    radius: newRadius,
                },
            });
        },
    };

    return toolHandler;
};
