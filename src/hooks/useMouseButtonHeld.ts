import { useEffect, useState } from "react";

export const useMouseButtonHeld = ({
    button,
    onDown,
    onUp,
}: {
    button: number; // 0 for left, 1 for middle, 2 for right
    onDown?: (e: MouseEvent) => void;
    onUp?: (e: MouseEvent) => void;
}) => {
    const [buttonHeld, setButtonHeld] = useState(false);

    const downHandler = (e: MouseEvent) => {
        if (e.button === button) {
            setButtonHeld(true);
            onDown?.(e);
        }
    };

    const upHandler = (e: MouseEvent) => {
        if (e.button === button) {
            setButtonHeld(false);
            onUp?.(e);
        }
    };

    useEffect(() => {
        window.addEventListener("mousedown", downHandler);
        window.addEventListener("mouseup", upHandler);
        return () => {
            window.removeEventListener("mousedown", downHandler);
            window.removeEventListener("mouseup", upHandler);
        };
    }, []);

    return buttonHeld;
};
