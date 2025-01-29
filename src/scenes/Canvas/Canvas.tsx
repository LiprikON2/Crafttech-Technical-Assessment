import { useRef, useState } from "react";
import { Layer, Stage, Text } from "react-konva";
import Konva from "konva";

import { clamp } from "~/utils";
import { useKeyHeld, useMouseButtonHeld } from "~/hooks";
import { ColoredRect, GridLayer } from "./components";
import classes from "./Canvas.module.css";

interface CanvasProps {
    //
}

Konva.dragButtons = [1];

export const Canvas = ({}: CanvasProps) => {
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

    return (
        <Stage
            className={classes.stage}
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
                <Text text="Try click on rect" />
                <ColoredRect />
            </Layer>
            <Layer>
                <Text text="Try click on rect 2" />
                {/* <ColoredRect x={cursorPos.x} y={cursorPos.y} /> */}
                <ColoredRect x={600} y={300} />
            </Layer>
        </Stage>
    );
};
