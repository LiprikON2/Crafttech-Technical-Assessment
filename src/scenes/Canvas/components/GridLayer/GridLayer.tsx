import { Layer, Rect } from "react-konva";

import classes from "./GridLayer.module.css";
import Konva from "konva";
import { useEffect, useRef } from "react";

interface GridLayerProps {
    x: number;
    y: number;

    width?: number;
    height?: number;
    scale?: number;
}

export const GridLayer = ({ x, y, width = 150, height = 150, scale = 1 }: GridLayerProps) => {
    // ref: https://github.com/konvajs/konva/issues/898
    // const gridRef = useRef<Konva.Layer>(null);
    // useEffect(() => {
    //     if (gridRef.current) {
    //         gridRef.current.cache();
    //     }
    // }, [gridRef]);

    const invScale = 1 / scale;
    const invX = -x * invScale;
    const invY = -y * invScale;

    const startX = Math.floor((invX - window.innerWidth * invScale) / width) * width;
    const endX = Math.floor((invX + window.innerWidth * invScale * 2) / width) * width;

    const startY = Math.floor((invY - window.innerHeight * invScale) / height) * height;
    const endY = Math.floor((invY + window.innerHeight * invScale * 2) / height) * height;

    const gridComponents = [];

    for (let x = startX; x < endX; x += width) {
        for (let y = startY; y < endY; y += height) {
            gridComponents.push(
                <Rect
                    key={`${x}.${y}`}
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    stroke="#111"
                    strokeWidth={0.5 / scale}
                />
            );
        }
    }
    console.log("x, y", x, y);
    console.log("scale", scale);
    console.log("count", gridComponents.length);
    console.log("");
    console.log("");

    return <Layer>{gridComponents}</Layer>;
};
