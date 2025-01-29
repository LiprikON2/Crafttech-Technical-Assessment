import { useState } from "react";
import Konva from "konva";
import { Rect } from "react-konva";

import classes from "./ColoredRect.module.css";

interface ColoredRectProps {
    x?: number;
    y?: number;
}

export const ColoredRect = ({ x = 20, y = 20 }: ColoredRectProps) => {
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
