import { useRef, useState } from "react";
import { useListState } from "@mantine/hooks";
import { Layer, Rect, Stage } from "react-konva";
import Konva from "konva";

import { Tool } from "~/App";
import { clamp } from "~/utils";
import { GridLayer } from "./components";
import { useToolEffects } from "./hooks";
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

const isShape = (value: string): value is Shapes => {
    return Object.keys(shapeComponentMap).includes(value as Shapes);
};

export type Shape = {
    type: Shapes;
    props: { x: number; y: number; uuid: string } & Konva.NodeConfig;
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

                // ref: https://github.com/konvajs/react-konva/issues/164#issuecomment-360837853
                if (tool === "rectangle") {
                    const mousePos = getMousePos();
                    if (!mousePos) return;

                    setDrawingMarquee({
                        type: "rectangle",
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
                    });
                }

                if (tool === "move-tool") {
                    console.log(
                        "isShape(e.target.attrs.type)",
                        isShape(e.target.attrs.type),
                        e.target.attrs
                    );
                    if (isShape(e.target.attrs.type)) {
                        const shapeIndex = shapes.findIndex(
                            (shape) => shape.props.uuid === e.target.attrs.uuid
                        );
                        if (shapeIndex === -1) return;

                        const shape = shapes[shapeIndex];

                        const dragOriginX = mousePos.x - shape.props.x;
                        const dragOriginY = mousePos.y - shape.props.y;
                        console.log("shape.props.cornerRadius", shape.props.cornerRadius);
                        setDragOrigin({ x: dragOriginX, y: dragOriginY });
                        setTarget(shape.props.uuid);
                        setTargetHandles({
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
                        });

                        shapeHandlers.reorder({ from: shapeIndex, to: shapes.length - 1 });
                    } else {
                        setTarget(null);
                    }
                }
            }}
            onMouseUp={(e) => {
                const mousePos = getMousePos();
                if (!mousePos) return;

                if (tool === "rectangle") {
                    if (drawingMarquee === null) return;
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
                    setTargetHandles({
                        type: newShape.type,
                        props: {
                            x: newShape.props.x,
                            y: newShape.props.y,
                            uuid: crypto.randomUUID(),
                            stroke: "#888",
                            dash: [4, 4],
                            width: newShape.props.width,
                            height: newShape.props.height,
                            cornerRadius: newShape.props.cornerRadius,
                            scaleX: newShape.props.scaleX,
                            scaleY: newShape.props.scaleY,
                        },
                    });
                }

                if (tool === "move-tool") {
                    setDragOrigin(null);
                }
            }}
            onMouseMove={(e) => {
                const mousePos = getMousePos();
                if (!mousePos) return;

                if (tool === "rectangle") {
                    if (drawingMarquee === null) return;
                    const newWidth = mousePos.x - drawingMarquee.props.x;
                    const newHeight = mousePos.y - drawingMarquee.props.y;

                    // ref: https://github.com/konvajs/konva/issues/374

                    let scaleX,
                        scaleY = 1;
                    if (newWidth < 0) scaleX = -1;
                    if (newHeight < 0) scaleY = -1;

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
                }
                if (tool === "move-tool") {
                    if (target === null) return;
                    if (dragOrigin === null) return;

                    const shapeIndex = shapes.findIndex(
                        (shape) => shape.props.uuid === e.target.attrs.uuid
                    );
                    if (shapeIndex === -1) return;

                    const shape = shapes[shapeIndex];

                    const newX = mousePos.x - dragOrigin.x;
                    const newY = mousePos.y - dragOrigin.y;

                    shapeHandlers.setItem(shapeIndex, {
                        ...shape,
                        props: {
                            ...shape.props,
                            x: newX,
                            y: newY,
                        },
                    });

                    if (targetHandles === null) return;
                    setTargetHandles({
                        ...targetHandles,
                        props: {
                            ...targetHandles.props,
                            x: newX,
                            y: newY,
                        },
                    });
                }
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
