import Konva from "konva";
import { UseListStateHandlers } from "@mantine/hooks";

import {
    createDrawingMarquee,
    createTargetHandles,
    MouseButtons,
    Shape,
    ToolHandler,
} from "../../../Canvas";

interface TriangleToolHandler {
    drawingMarquee: Shape | null;
    setDrawingMarquee: (value: Shape | null) => void;
    setTarget: (value: string | null) => void;
    shapeHandlers: UseListStateHandlers<Shape>;
    setTargetHandles: (value: Shape | null) => void;
}

export const useTriangleTool = ({
    drawingMarquee,
    setDrawingMarquee,
    shapeHandlers,
    setTarget,
    setTargetHandles,
}: TriangleToolHandler) => {
    const toolHandler: ToolHandler = {
        // ref: https://github.com/konvajs/react-konva/issues/164#issuecomment-360837853
        onPointerDown: (e, mousePos) => {
            if (e.evt.button !== MouseButtons.Left) return;

            setDrawingMarquee(createDrawingMarquee("triangle", mousePos));
        },

        onPointerUp: (e, mousePos) => {
            if (e.evt.button !== MouseButtons.Left) return;

            if (!drawingMarquee || drawingMarquee.shapeProps.radius === 0) {
                setDrawingMarquee(null);
                return;
            }

            const newShape: Shape = {
                type: "triangle",
                commonProps: {
                    x: drawingMarquee.commonProps.x,
                    y: drawingMarquee.commonProps.y,
                    rotation: drawingMarquee.commonProps.rotation,
                    uuid: crypto.randomUUID(),
                    fill: Konva.Util.getRandomColor(),
                    shadowBlur: 5,
                },
                shapeProps: {
                    sides: drawingMarquee.shapeProps.sides,
                    radius: drawingMarquee.shapeProps.radius,
                },
            };

            shapeHandlers.append(newShape);
            setDrawingMarquee(null);

            setTarget(newShape.commonProps.uuid);
            setTargetHandles(createTargetHandles(newShape));
        },

        onPointerMove: (e, mousePos) => {
            if (!drawingMarquee) return;
            const deltaX = mousePos.x - drawingMarquee.commonProps.x;
            const deltaY = mousePos.y - drawingMarquee.commonProps.y;

            const newRadius = Math.sqrt(deltaX ** 2 + deltaY ** 2);
            const newRotation = getRotation(deltaX, deltaY) - 30;

            setDrawingMarquee({
                ...drawingMarquee,
                commonProps: {
                    ...drawingMarquee.commonProps,
                    rotation: newRotation,
                },
                shapeProps: {
                    ...drawingMarquee.shapeProps,
                    radius: newRadius,
                },
            });
        },
    };

    return toolHandler;
};

const getRotation = (deltaX: number, deltaY: number) => {
    const rotationRad = Math.atan2(deltaY, deltaX);
    const rotation = rotationRad * (180 / Math.PI);
    return rotation;
};
