import { clamp } from "@mantine/hooks";
import Konva from "konva";

interface ZoomHandlers {
    scaleBy?: number;
    minScale?: number;
    maxScale?: number;
    stageRef: React.RefObject<Konva.Stage>;
    setStageScale: (value: number) => void;
    setStagePos: (value: Konva.Vector2d) => void;
}

export const useZoomHandlers = ({
    stageRef,
    setStageScale,
    setStagePos,
    scaleBy = 1.1,
    minScale = 0.5,
    maxScale = 5,
}: ZoomHandlers) => {
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

    return {
        onWheelZoom: handleWheelZoom,
    };
};
