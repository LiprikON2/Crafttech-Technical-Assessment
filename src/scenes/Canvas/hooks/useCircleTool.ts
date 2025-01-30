import Konva from "konva";
import { UseListStateHandlers } from "@mantine/hooks";

import {
    createDrawingMarquee,
    createTargetHandles,
    MouseButtons,
    Shape,
    ToolHandler,
} from "../Canvas";

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
        onMouseDown: (e: Konva.KonvaEventObject<MouseEvent>, mousePos: Konva.Vector2d) => {
            if (e.evt.button !== MouseButtons.Left) return;

            setDrawingMarquee(createDrawingMarquee("circle", mousePos));
        },

        onMouseUp: (e: Konva.KonvaEventObject<MouseEvent>, mousePos: Konva.Vector2d) => {
            if (e.evt.button !== MouseButtons.Left) return;

            if (!drawingMarquee || drawingMarquee.props.radius === 0) {
                setDrawingMarquee(null);
                return;
            }

            const newShape: Shape = {
                type: "circle",
                props: {
                    x: drawingMarquee.props.x,
                    y: drawingMarquee.props.y,
                    uuid: crypto.randomUUID(),
                    radius: drawingMarquee.props.radius,
                    fill: Konva.Util.getRandomColor(),
                    shadowBlur: 5,
                },
            };

            shapeHandlers.append(newShape);
            setDrawingMarquee(null);

            setTarget(newShape.props.uuid);
            setTargetHandles(createTargetHandles(newShape));
        },

        onMouseMove: (e: Konva.KonvaEventObject<MouseEvent>, mousePos: Konva.Vector2d) => {
            if (!drawingMarquee) return;
            const deltaX = mousePos.x - drawingMarquee.props.x;
            const deltaY = mousePos.y - drawingMarquee.props.y;

            const newRadius = Math.sqrt(deltaX ** 2 + deltaY ** 2);

            setDrawingMarquee({
                ...drawingMarquee,
                props: {
                    ...drawingMarquee.props,
                    radius: newRadius,
                },
            });
        },
    };

    return toolHandler;
};
