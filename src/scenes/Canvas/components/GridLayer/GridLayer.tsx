import { Layer, Shape } from "react-konva";

interface GridLayerProps {
    x: number;
    y: number;

    width?: number;
    height?: number;
    scale?: number;
}

export const GridLayer = ({ x, y, width = 30, height = 30, scale = 1 }: GridLayerProps) => {
    // ref: https://github.com/konvajs/konva/issues/898

    const invScale = 1 / scale;
    const invX = -x * invScale;
    const invY = -y * invScale;

    const startX = Math.floor((invX - window.innerWidth * invScale) / width) * width;
    const endX = Math.floor((invX + window.innerWidth * invScale * 2) / width) * width;

    const startY = Math.floor((invY - window.innerHeight * invScale) / height) * height;
    const endY = Math.floor((invY + window.innerHeight * invScale * 2) / height) * height;

    return (
        <Layer>
            <Shape
                sceneFunc={(context, shape) => {
                    // ref: https://konvajs.org/docs/shapes/Custom.html
                    context.beginPath();
                    context.strokeStyle = "#111";
                    context.lineWidth = 0.5 / scale;

                    // Vertical lines
                    for (let x = startX; x < endX; x += width) {
                        context.moveTo(x, startY);
                        context.lineTo(x, endY);
                    }

                    // Horizontal lines
                    for (let y = startY; y < endY; y += height) {
                        context.moveTo(startX, y);
                        context.lineTo(endX, y);
                    }

                    context.stroke();
                }}
                /* Empty hit function since grid doesn't need interaction */
                hitFunc={(context, shape) => {}}
                listening={false}
                perfectDrawEnabled={false}
                shadowForStrokeEnabled={false}
            />
        </Layer>
    );
};
