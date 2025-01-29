import { useRef, useState } from "react";
import { Layer, Rect, Stage, Text } from "react-konva";
import Konva from "konva";

import "./App.css";
import { clamp } from "./utils";
import { useKeyHeld, useMouseButtonHeld } from "./hooks";

Konva.dragButtons = [1];

const ColoredRect = ({ x = 20, y = 20 }: { x?: number; y?: number }) => {
    const [color, setColor] = useState("green");

    const handleClick = () => {
        setColor(Konva.Util.getRandomColor());
    };

    return (
        <Rect
            x={x}
            y={y}
            width={50}
            height={50}
            fill={color}
            shadowBlur={5}
            onClick={handleClick}
        />
    );
};

const App = () => {
    const scaleBy = 1.1;
    const minScale = 0.5;
    const maxScale = 5;

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
        onDown: () => {
            if (!stageRef.current) return;
            stageRef.current.container().style.cursor = "grab";
        },
        onUp: () => {
            if (!stageRef.current) return;
            stageRef.current.container().style.cursor = "default";
        },
    });

    return (
        <Stage
            onContextMenu={(e) => {
                // Disable vanilla html context menu
                e.evt.preventDefault();
            }}
            ref={stageRef}
            width={window.innerWidth}
            height={window.innerHeight}
            draggable
            onDragEnd={(e) => {
                // console.log(e, "dragend");
            }}
            onWheel={(e) => {
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

                stageRef.current.scale({ x: clampedNewScale, y: clampedNewScale });

                const newPos = {
                    x: pointer.x - mousePointTo.x * clampedNewScale,
                    y: pointer.y - mousePointTo.y * clampedNewScale,
                };
                stageRef.current.position(newPos);
            }}
        >
            <Layer>
                <Text text="Try click on rect" />
                <ColoredRect />
            </Layer>
            <Layer>
                <Text text="Try click on rect 2" />
                <ColoredRect x={600} y={300} />
            </Layer>
        </Stage>
    );
};

export default App;
