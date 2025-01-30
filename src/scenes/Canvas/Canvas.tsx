import { useRef, useState } from "react";
import { useListState } from "@mantine/hooks";
import { Layer, Stage, Text } from "react-konva";
import Konva from "konva";

import { Tool } from "~/App";
import { clamp } from "~/utils";
import { useKeyHeld, useMouseButtonHeld } from "~/hooks";
import { ColoredRect, GridLayer } from "./components";
import classes from "./Canvas.module.css";

interface CanvasProps {
    tool: Tool;
    setTool: (value: Tool) => void;
}

Konva.dragButtons = [1];

interface ShapeComponentMap {
    [key: string]: React.ComponentType<{ x: number; y: number }>;
}

const shapeComponentMap: ShapeComponentMap = {
    // circle: Circle,
    rectangle: ColoredRect,
};

export const Canvas = ({ tool, setTool }: CanvasProps) => {
    const scaleBy = 1.1;
    const minScale = 0.5;
    const maxScale = 5;

    const [stageScale, setStageScale] = useState(1);

    const [stagePos, setStagePos] = useState({ x: 0, y: 0 });

    const stageRef = useRef<Konva.Stage>(null);

    /* Can drag stage with middle mouse button or also left and right while spacebar is held */
    useKeyHeld({
        code: "Space",
        onDown: () => {
            Konva.dragButtons = [0, 1, 2]; // Left, middle, right mouse buttons
            if (!stageRef.current) return;
            stageRef.current.container().style.cursor = "grab";
        },
        onUp: () => {
            Konva.dragButtons = [1]; // Middle mouse button

            if (!stageRef.current) return;
            stageRef.current.container().style.cursor = "default";
        },
    });
    useMouseButtonHeld({
        button: 1,
        onDown: (e) => {
            e.preventDefault();
            if (!stageRef.current) return;
            stageRef.current.container().style.cursor = "grab";
        },
        onUp: (e) => {
            e.preventDefault();

            if (!stageRef.current) return;
            stageRef.current.container().style.cursor = "default";
        },
    });

    // const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

    // const [dragPause, setDragPause] = useState(false);
    // const [lastCenter, setLastCenter] = useState<Konva.Vector2d | null>(null);
    // const [lastDist, setLastDist] = useState(0);

    // const getCenter = (p1: Konva.Vector2d, p2: Konva.Vector2d) => {
    //     return {
    //         x: (p1.x + p2.x) / 2,
    //         y: (p1.y + p2.y) / 2,
    //     };
    // };

    // const getDistance = (p1: Konva.Vector2d, p2: Konva.Vector2d) => {
    //     return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    // };

    const [shapes, shapeHandlers] = useListState([{ type: "rectangle", x: 0, y: 0 }]);

    return (
        <Stage
            className={classes.stage}
            onClick={(e) => {
                if (tool === "rectangle") {
                    console.log("place");
                }
            }}
            onMouseMove={(e) => {}}
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
            // onMouseMove={(e) => {
            //     // ref: https://stackoverflow.com/a/56870752
            //     if (!stageRef.current) return;

            //     var transform = stageRef.current.getAbsoluteTransform().copy();
            //     // to detect relative position we need to invert transform
            //     transform.invert();
            //     // now we find relative point
            //     const pos = stageRef.current.getPointerPosition();

            //     if (!pos) return;
            //     setCursorPos(transform.point(pos));
            // }}

            onWheel={(e) => {
                // ref: https://konvajs.org/docs/sandbox/Zooming_Relative_To_Pointer.html
                // stop default scrolling
                e.evt.preventDefault();
                if (!stageRef.current) return;

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
            }}
        >
            <GridLayer x={stagePos.x} y={stagePos.y} scale={stageScale} />
            <Layer>
                {shapes.map((shape, index) => {
                    const ShapeComponent = shapeComponentMap[shape.type];

                    return <ShapeComponent key={index} x={shape.x} y={shape.y} />;
                })}
            </Layer>
            <Layer>
                {/* <ColoredRect x={cursorPos.x}z y={cursorPos.y} /> */}
                <ColoredRect x={600} y={300} />
            </Layer>
        </Stage>
    );
};
