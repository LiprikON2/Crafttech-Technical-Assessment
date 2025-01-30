import { useEffect, useState } from "react";
import { MouseButtons } from "~/scenes";

export const useMouseButtonHeld = (
    {
        button,
        onDown,
        onUp,
    }: {
        button: MouseButtons;
        onDown?: (e: MouseEvent) => void;
        onUp?: (e: MouseEvent) => void;
    },
    deps: React.DependencyList = []
) => {
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
    }, deps);

    return buttonHeld;
};
