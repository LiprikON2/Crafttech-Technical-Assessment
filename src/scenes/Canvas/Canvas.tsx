import { useRef, useState } from "react";
import { useListState } from "@mantine/hooks";
import { Layer, Rect, Stage } from "react-konva";
import Konva from "konva";

import { Tool } from "~/App";
import { clamp } from "~/utils";
import { GridLayer } from "./components";
import { useMoveTool, useRectangleTool, useToolEffects } from "./hooks";
import classes from "./Canvas.module.css";

interface CanvasProps {
    tool: Tool;
    setTool: (value: Tool) => void;
}

const shapeComponentMap = {
    // circle: Circle,
    rectangle: Rect,
};

type Shapes = keyof typeof shapeComponentMap;

export const isShape = (value: string): value is Shapes => {
    return Object.keys(shapeComponentMap).includes(value as Shapes);
};

export interface ToolHandler {
    onMouseDown: (e: Konva.KonvaEventObject<MouseEvent>, mousePos: Konva.Vector2d) => void;
    onMouseMove: (e: Konva.KonvaEventObject<MouseEvent>, mousePos: Konva.Vector2d) => void;
    onMouseUp: (e: Konva.KonvaEventObject<MouseEvent>, mousePos: Konva.Vector2d) => void;
}

export type Shape = {
    type: Shapes;
    props: { x: number; y: number; uuid: string } & Konva.NodeConfig;
};

export const createTargetHandles = (shape: Shape) => {
    return {
        type: shape.type,
        props: {
            x: shape.props.x,
            y: shape.props.y,
            uuid: crypto.randomUUID(),
            stroke: "#888",
            dash: [4, 4],
            width: shape.props.width,
            height: shape.props.height,
            cornerRadius: shape.props.cornerRadius,
            scaleX: shape.props.scaleX,
            scaleY: shape.props.scaleY,
        },
    };
};

export const createDrawingMarquee = (type: Shapes, mousePos: Konva.Vector2d) => {
    return {
        type,
        props: {
            x: mousePos.x,
            y: mousePos.y,
            uuid: crypto.randomUUID(),
            stroke: "#888",
            dash: [2, 2],
            width: 0,
            height: 0,
            cornerRadius: 5,
        },
    };
};

export const Canvas = ({ tool, setTool }: CanvasProps) => {
    const scaleBy = 1.1;
    const minScale = 0.5;
    const maxScale = 5;

    const [stageScale, setStageScale] = useState(1);

    const [stagePos, setStagePos] = useState({ x: 0, y: 0 });

    const stageRef = useRef<Konva.Stage>(null);

    const {
        drawingMarquee,
        setDrawingMarquee,
        target,
        setTarget,
        dragOrigin,
        setDragOrigin,
        targetHandles,
        setTargetHandles,
    } = useToolEffects(stageRef, tool, setTool);

    const DrawingMarquee = drawingMarquee && shapeComponentMap[drawingMarquee.type];
    const TargetHandles = targetHandles && shapeComponentMap[targetHandles.type];

    const [shapes, shapeHandlers] = useListState<Shape>([]);

    /* ref: https://stackoverflow.com/a/56870752 */
    const getMousePos = (): Konva.Vector2d | null => {
        if (!stageRef.current) return null;
        const transform = stageRef.current.getAbsoluteTransform().copy();
        // to detect relative position we need to invert transform
        transform.invert();
        // now we find relative point
        const pos = stageRef.current.getPointerPosition();

        if (!pos) return null;
        return transform.point(pos);
    };

    const handleWheelZoom = (e: Konva.KonvaEventObject<WheelEvent>) => {
        if (!stageRef.current) return;

        // ref: https://konvajs.org/docs/sandbox/Zooming_Relative_To_Pointer.html
        const oldScale = stageRef.current.scaleX();
        const pointer = stageRef.current.getPointerPosition();

        if (!pointer) return;

        const mousePointTo = {
            x: (pointer.x - stageRef.current.x()) / oldScale,
            y: (pointer.y - stageRef.current.y()) / oldScale,
        };

        // how to scale? Zoom in? Or zoom out?
        let direction = e.evt.deltaY > 0 ? -1 : 1;

        // when we zoom on trackpad, e.evt.ctrlKey is true
        // in that case lets revert direction
        if (e.evt.ctrlKey) {
            direction = -direction;
        }

        const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
        const clampedNewScale = clamp(newScale, minScale, maxScale);
        setStageScale(clampedNewScale);

        stageRef.current.scale({ x: clampedNewScale, y: clampedNewScale });

        const newPos = {
            x: pointer.x - mousePointTo.x * clampedNewScale,
            y: pointer.y - mousePointTo.y * clampedNewScale,
        };
        stageRef.current.position(newPos);
        setStagePos(newPos);
    };

    const rectangleToolHandler = useRectangleTool({
        drawingMarquee,
        setDrawingMarquee,
        shapeHandlers,
        setTarget,
        setTargetHandles,
    });

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

    const toolHandlers = {
        "move-tool": moveToolHandler,
        rectangle: rectangleToolHandler,
        circle: {
            onMouseDown: () => {},
            onMouseUp: () => {},
            onMouseMove: () => {},
        },
        triangle: {
            onMouseDown: () => {},
            onMouseUp: () => {},
            onMouseMove: () => {},
        },
        "hand-tool": {
            onMouseDown: () => {},
            onMouseUp: () => {},
            onMouseMove: () => {},
        },
    } as const;

    return (
        <Stage
            ref={stageRef}
            className={classes.stage}
            width={window.innerWidth}
            height={window.innerHeight}
            draggable
            onDragEnd={(e) => {
                setStagePos(e.currentTarget.position());
            }}
            onContextMenu={(e) => {
                // Disable default browser context menu
                e.evt.preventDefault();
            }}
            onWheel={(e) => {
                // Disable default browser scrolling
                e.evt.preventDefault();
                handleWheelZoom(e);
            }}
            onMouseDown={(e) => {
                const mousePos = getMousePos();
                if (!mousePos) return;

                toolHandlers[tool].onMouseDown(e, mousePos);
            }}
            onMouseUp={(e) => {
                const mousePos = getMousePos();
                if (!mousePos) return;

                toolHandlers[tool].onMouseUp(e, mousePos);
            }}
            onMouseMove={(e) => {
                const mousePos = getMousePos();
                if (!mousePos) return;

                toolHandlers[tool].onMouseMove(e, mousePos);
            }}
        >
            <GridLayer x={stagePos.x} y={stagePos.y} scale={stageScale} />
            <Layer>
                {shapes.map(({ type, props }) => {
                    const ShapeComponent = shapeComponentMap[type];
                    return <ShapeComponent key={props.uuid} type={type} {...props} />;
                })}
            </Layer>
            <Layer>{DrawingMarquee && <DrawingMarquee {...drawingMarquee.props} />}</Layer>
            <Layer>
                {TargetHandles && <TargetHandles listening={false} {...targetHandles.props} />}
            </Layer>
        </Stage>
    );
};
