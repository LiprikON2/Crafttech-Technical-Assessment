import { useRef, useState } from "react";
import { useListState } from "@mantine/hooks";
import { Layer, Rect, Stage } from "react-konva";
import Konva from "konva";

import { Tool } from "~/App";
import { clamp } from "~/utils";
import { ColoredRect, GridLayer } from "./components";
import { useToolEffects } from "./hooks";
import classes from "./Canvas.module.css";

interface CanvasProps {
    tool: Tool;
    setTool: (value: Tool) => void;
}

interface ShapeComponentMap {
    [key: string]: React.ComponentType<any>;
}

const shapeComponentMap: ShapeComponentMap = {
    // circle: Circle,
    rectangle: Rect,
};

type Shape = {
    type: string;
    props: { x: number; y: number } & Konva.NodeConfig;
};

export const Canvas = ({ tool, setTool }: CanvasProps) => {
    const scaleBy = 1.1;
    const minScale = 0.5;
    const maxScale = 5;

    const [stageScale, setStageScale] = useState(1);

    const [stagePos, setStagePos] = useState({ x: 0, y: 0 });

    const stageRef = useRef<Konva.Stage>(null);

    const { isDrawing, setIsDrawing } = useToolEffects(stageRef, tool, setTool);

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

    return (
        <Stage
            className={classes.stage}
            onMouseDown={(e) => {
                // ref: https://github.com/konvajs/react-konva/issues/164#issuecomment-360837853
                if (tool === "rectangle") {
                    const mousePos = getMousePos();
                    if (!mousePos) return;

                    shapeHandlers.append({
                        type: tool,
                        props: {
                            x: mousePos.x,
                            y: mousePos.y,
                            fill: Konva.Util.getRandomColor(),
                            width: 0,
                            height: 0,
                        },
                    });
                    setIsDrawing(true);
                }
            }}
            onMouseUp={(e) => {
                if (tool === "rectangle" && isDrawing) {
                    setIsDrawing(false);
                }
            }}
            onMouseMove={(e) => {
                if (!isDrawing) return;

                const mousePos = getMousePos();
                if (!mousePos) return;

                if (tool === "rectangle") {
                    const currShapeIndex = shapes.length - 1;
                    const currShape = shapes[currShapeIndex];
                    const newWidth = mousePos.x - currShape.props.x;
                    const newHeight = mousePos.y - currShape.props.y;

                    shapeHandlers.setItem(currShapeIndex, {
                        ...currShape,
                        props: {
                            ...currShape.props,
                            width: newWidth,
                            height: newHeight,
                        },
                    });
                }
            }}
            onContextMenu={(e) => {
                // Disable browser html context menu
                e.evt.preventDefault();
            }}
            ref={stageRef}
            width={window.innerWidth}
            height={window.innerHeight}
            draggable
            onDragEnd={(e) => {
                setStagePos(e.currentTarget.position());
            }}
            onWheel={(e) => {
                // Stop default scrolling
                e.evt.preventDefault();
                handleWheelZoom(e);
            }}
        >
            <GridLayer x={stagePos.x} y={stagePos.y} scale={stageScale} />
            <Layer>
                {shapes.map(({ type, props }, index) => {
                    const ShapeComponent = shapeComponentMap[type];
                    return <ShapeComponent key={index} {...props} />;
                })}
            </Layer>
            <Layer>
                <ColoredRect x={600} y={300} />
            </Layer>
        </Stage>
    );
};
