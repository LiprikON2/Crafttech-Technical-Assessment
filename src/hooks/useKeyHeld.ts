import { useEffect, useState } from "react";

export const useKeyHeld = ({
    code,
    onDown,
    onUp,
}: {
    code: KeyboardEvent["code"];
    onDown?: (e: KeyboardEvent) => void;
    onUp?: (e: KeyboardEvent) => void;
}) => {
    const [keyHeld, setKeyHeld] = useState(false);

    const downHandler = (e: KeyboardEvent) => {
        if (e.code === code) {
            setKeyHeld(true);
            onDown?.(e);
        }
    };

    const upHandler = (e: KeyboardEvent) => {
        if (e.code === code) {
            setKeyHeld(false);
            onUp?.(e);
        }
    };

    useEffect(() => {
        window.addEventListener("keydown", downHandler);
        window.addEventListener("keyup", upHandler);
        return () => {
            window.removeEventListener("keydown", downHandler);
            window.removeEventListener("keyup", upHandler);
        };
    }, []);

    return keyHeld;
};
