import Konva from "konva";
import { UseListStateHandlers } from "@mantine/hooks";

import { createTargetHandles, isShape, MouseButtons, Shape, ToolHandler } from "../../../Canvas";

interface MoveToolHandler {
    shapes: Shape[];
    dragOrigin: Konva.Vector2d | null | null;
    setDragOrigin: (value: Konva.Vector2d | null) => void;
    target: string | null;
    setTarget: (value: string | null) => void;
    shapeHandlers: UseListStateHandlers<Shape>;
    targetHandles: Shape | null;
    setTargetHandles: (value: Shape | null) => void;
}

export const useMoveTool = ({
    shapes,
    dragOrigin,
    setDragOrigin,
    shapeHandlers,
    target,
    setTarget,
    targetHandles,
    setTargetHandles,
}: MoveToolHandler) => {
    const toolHandler: ToolHandler = {
        onMouseDown: (e, mousePos) => {
            if (e.evt.button !== MouseButtons.Left) return;

            if (!isShape(e.target.attrs.type)) {
                setTarget(null);
                return;
            }

            const shapeIndex = shapes.findIndex(
                (shape) => shape.commonProps.uuid === e.target.attrs.uuid
            );
            if (shapeIndex === -1) return;

            const shape = shapes[shapeIndex];
            const dragOrigin = {
                x: mousePos.x - shape.commonProps.x,
                y: mousePos.y - shape.commonProps.y,
            };

            setDragOrigin(dragOrigin);
            setTarget(shape.commonProps.uuid);
            setTargetHandles(createTargetHandles(shape));
            shapeHandlers.reorder({ from: shapeIndex, to: shapes.length - 1 });
        },

        onMouseUp: (e, mousePos) => {
            if (e.evt.button !== MouseButtons.Left) return;

            setDragOrigin(null);
        },

        onMouseMove: (e, mousePos) => {
            if (!target || !dragOrigin) return;

            const shapeIndex = shapes.findIndex(
                (shape) => shape.commonProps.uuid === e.target.attrs.uuid
            );
            if (shapeIndex === -1) return;

            const shape = shapes[shapeIndex];
            const newPos = {
                x: mousePos.x - dragOrigin.x,
                y: mousePos.y - dragOrigin.y,
            };

            shapeHandlers.setItem(shapeIndex, {
                ...shape,
                commonProps: {
                    ...shape.commonProps,
                    x: newPos.x,
                    y: newPos.y,
                },
            });

            if (targetHandles === null) return;
            setTargetHandles({
                ...targetHandles,
                commonProps: {
                    ...targetHandles.commonProps,
                    x: newPos.x,
                    y: newPos.y,
                },
            });
        },
    };

    return toolHandler;
};
