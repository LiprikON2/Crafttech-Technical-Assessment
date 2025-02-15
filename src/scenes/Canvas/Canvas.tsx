import { useRef, useState } from "react";
import { useListState } from "@mantine/hooks";
import { Circle, Layer, Rect, RegularPolygon, Stage } from "react-konva";
import Konva from "konva";

import { Tool } from "~/App";
import { GridLayer, ShapeContextMenu } from "./components";
import { useToolEffects, useToolHandlers, useZoomHandlers } from "./hooks";
import classes from "./Canvas.module.css";

interface CanvasProps {
    tool: Tool;
    setTool: (value: Tool) => void;
}

const shapeComponentMap = {
    circle: Circle,
    rectangle: Rect,
    triangle: RegularPolygon,
};

export type ShapeContextMenuState = {
    x: number;
    y: number;
    shape: Shape | null;
    shapeIndex: number | null;
};

type Shapes = keyof typeof shapeComponentMap;

export const isShape = (value: string): value is Shapes => {
    return Object.keys(shapeComponentMap).includes(value as Shapes);
};

export interface ToolHandler {
    onPointerDown: (e: Konva.KonvaEventObject<MouseEvent>, mousePos: Konva.Vector2d) => void;
    onPointerMove: (e: Konva.KonvaEventObject<MouseEvent>, mousePos: Konva.Vector2d) => void;
    onPointerUp: (e: Konva.KonvaEventObject<MouseEvent>, mousePos: Konva.Vector2d) => void;
}

export type Shape = {
    type: Shapes;
    commonProps: { x: number; y: number; uuid: string } & Konva.NodeConfig & Konva.ShapeConfig;
    shapeProps: {} & Konva.RectConfig & Konva.CircleConfig & Partial<Konva.RegularPolygonConfig>;
};

export const createDrawingMarquee = (type: Shapes, mousePos: Konva.Vector2d) => {
    const commonProps = {
        x: mousePos.x,
        y: mousePos.y,
        uuid: crypto.randomUUID(),
        stroke: "#888",
        dash: [2, 2],
        rotation: 0,
    };

    switch (type) {
        case "rectangle":
            return {
                type,
                commonProps,
                shapeProps: {
                    width: 0,
                    height: 0,
                    cornerRadius: 5,
                },
            };
        case "circle":
            return {
                type,
                commonProps,
                shapeProps: {
                    radius: 0,
                },
            };
        case "triangle":
            return {
                type,
                commonProps,
                shapeProps: {
                    radius: 0,
                    sides: 3,
                },
            };
    }
};

export const createTargetHandles = (shape: Shape) => {
    const commonProps = {
        x: shape.commonProps.x,
        y: shape.commonProps.y,
        rotation: shape.commonProps.rotation,

        uuid: crypto.randomUUID(),
        stroke: "#888",
        dash: [4, 4],
    };

    switch (shape.type) {
        case "rectangle":
            return {
                type: shape.type,
                commonProps,
                shapeProps: {
                    width: shape.shapeProps.width,
                    height: shape.shapeProps.height,
                    cornerRadius: shape.shapeProps.cornerRadius,
                    scaleX: shape.shapeProps.scaleX,

                    scaleY: shape.shapeProps.scaleY,
                },
            };
        case "circle":
            return {
                type: shape.type,
                commonProps,
                shapeProps: {
                    radius: shape.shapeProps.radius,
                },
            };
        case "triangle":
            return {
                type: shape.type,
                commonProps,
                shapeProps: {
                    radius: shape.shapeProps.radius,
                    sides: shape.shapeProps.sides,
                },
            };
    }
};

export enum MouseButtons {
    Left = 0,
    Middle = 1,
    Right = 2,
}

export const Canvas = ({ tool, setTool }: CanvasProps) => {
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
    } = useToolEffects({ stageRef, tool, setTool });

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

    const zoomHandlers = useZoomHandlers({ stageRef, setStageScale, setStagePos });

    const toolHandlers = useToolHandlers({
        drawingMarquee,
        setDrawingMarquee,
        setTargetHandles,
        shapes,
        dragOrigin,
        setDragOrigin,
        target,
        setTarget,
        shapeHandlers,
        targetHandles,
    });

    const [contextMenu, setContextMenu] = useState<{
        x: number;
        y: number;
        shape: Shape | null;
        shapeIndex: number | null;
    }>({
        x: 0,
        y: 0,
        shape: null,
        shapeIndex: null,
    });
    const dissmissContextMenu = () => {
        setContextMenu({
            x: 0,
            y: 0,
            shape: null,
            shapeIndex: null,
        });
    };

    const removeShape = () => {
        if (contextMenu.shapeIndex === null) return;

        shapeHandlers.remove(contextMenu.shapeIndex);
        setTargetHandles(null);
        dissmissContextMenu();
    };

    return (
        <>
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
                    zoomHandlers.onWheelZoom(e);
                }}
                onPointerDown={(e) => {
                    dissmissContextMenu();
                    const mousePos = getMousePos();
                    if (!mousePos) return;

                    toolHandlers[tool].onPointerDown(e, mousePos);
                }}
                onPointerUp={(e) => {
                    const mousePos = getMousePos();
                    if (!mousePos) return;

                    toolHandlers[tool].onPointerUp(e, mousePos);
                }}
                onPointerMove={(e) => {
                    const mousePos = getMousePos();
                    if (!mousePos) return;

                    toolHandlers[tool].onPointerMove(e, mousePos);
                }}
            >
                <GridLayer x={stagePos.x} y={stagePos.y} scale={stageScale} />
                <Layer>
                    {shapes.map(({ type, commonProps, shapeProps }, index) => {
                        const ShapeComponent = shapeComponentMap[type];

                        return (
                            <ShapeComponent
                                onContextMenu={(e) => {
                                    setContextMenu({
                                        x: e.evt.clientX,
                                        y: e.evt.clientY,
                                        shape: shapes[index],
                                        shapeIndex: index,
                                    });
                                    setTargetHandles(createTargetHandles(shapes[index]));
                                }}
                                key={commonProps.uuid}
                                type={type}
                                {...commonProps}
                                {...shapeProps}
                                sides={shapeProps.sides!}
                                radius={shapeProps.radius!}
                            />
                        );
                    })}
                </Layer>
                <Layer>
                    {DrawingMarquee && (
                        <DrawingMarquee
                            {...drawingMarquee.commonProps}
                            {...drawingMarquee.shapeProps}
                            sides={drawingMarquee.shapeProps.sides!}
                            radius={drawingMarquee.shapeProps.radius!}
                        />
                    )}
                </Layer>
                <Layer>
                    {TargetHandles && (
                        <TargetHandles
                            listening={false}
                            {...targetHandles.commonProps}
                            {...targetHandles.shapeProps}
                            sides={targetHandles.shapeProps.sides!}
                            radius={targetHandles.shapeProps.radius!}
                        />
                    )}
                </Layer>
            </Stage>
            <ShapeContextMenu
                contextMenu={contextMenu}
                shapeHandlers={shapeHandlers}
                removeShape={removeShape}
            />
        </>
    );
};
