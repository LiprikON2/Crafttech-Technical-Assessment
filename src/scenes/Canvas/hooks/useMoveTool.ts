import Konva from "konva";
import { createTargetHandles, isShape, Shape } from "../Canvas";
import { UseListStateHandlers } from "@mantine/hooks";

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
    const toolHandler = {
        onMouseDown: (e: Konva.KonvaEventObject<MouseEvent>, mousePos: Konva.Vector2d) => {
            if (!isShape(e.target.attrs.type)) {
                setTarget(null);
                return;
            }

            const shapeIndex = shapes.findIndex(
                (shape) => shape.props.uuid === e.target.attrs.uuid
            );
            if (shapeIndex === -1) return;

            const shape = shapes[shapeIndex];
            const dragOrigin = { x: mousePos.x - shape.props.x, y: mousePos.y - shape.props.y };

            setDragOrigin(dragOrigin);
            setTarget(shape.props.uuid);
            setTargetHandles(createTargetHandles(shape));
            shapeHandlers.reorder({ from: shapeIndex, to: shapes.length - 1 });
        },

        onMouseUp: (e: Konva.KonvaEventObject<MouseEvent>, mousePos: Konva.Vector2d) => {
            setDragOrigin(null);
        },

        onMouseMove: (e: Konva.KonvaEventObject<MouseEvent>, mousePos: Konva.Vector2d) => {
            if (!target || !dragOrigin) return;

            const shapeIndex = shapes.findIndex(
                (shape) => shape.props.uuid === e.target.attrs.uuid
            );
            if (shapeIndex === -1) return;

            const shape = shapes[shapeIndex];
            const newPos = {
                x: mousePos.x - dragOrigin.x,
                y: mousePos.y - dragOrigin.y,
            };

            shapeHandlers.setItem(shapeIndex, {
                ...shape,
                props: {
                    ...shape.props,
                    x: newPos.x,
                    y: newPos.y,
                },
            });

            if (targetHandles === null) return;
            setTargetHandles({
                ...targetHandles,
                props: {
                    ...targetHandles.props,
                    x: newPos.x,
                    y: newPos.y,
                },
            });
        },
    };

    return toolHandler;
};
