import { clamp } from "~/utils";
import classes from "./ContextMenu.module.css";
import { useClickOutside, useElementSize, useMergedRef, useViewportSize } from "@mantine/hooks";

interface ContextMenuProps {
    x: number;
    y: number;
    visible?: boolean;
    children?: React.ReactNode;
}

export const ContextMenu = ({ x, y, visible = false, children }: ContextMenuProps) => {
    const { height: viewportHeight, width: viewportWidth } = useViewportSize();
    const { ref, width } = useElementSize();

    const getContextMenuPosStyle = (
        x: number,
        y: number,
        viewportWidth: number,
        viewportHeight: number
    ) => {
        const bottomRightStyle = {
            left: clamp(x, 0, viewportWidth),
            top: clamp(y, 0, viewportHeight),
        };
        const topRightStyle = {
            left: clamp(x, 0, viewportWidth),
            bottom: clamp(viewportHeight - y, 0, viewportHeight),
        };
        const topLeftStyle = {
            right: clamp(viewportWidth - x, 0, viewportWidth),
            bottom: clamp(viewportHeight - y, 0, viewportHeight),
        };
        const bottomLeftStyle = {
            right: clamp(viewportWidth - x, 0, viewportWidth),
            top: clamp(y, 0, viewportHeight),
        };

        if (y > viewportHeight / 2) {
            if (x + width > viewportWidth) return topLeftStyle;
            else return topRightStyle;
        } else {
            if (x + width > viewportWidth) return bottomLeftStyle;
            else return bottomRightStyle;
        }
    };

    return (
        <div
            ref={ref}
            className={classes.contextMenu}
            style={{
                visibility: visible ? "visible" : "hidden",
                ...getContextMenuPosStyle(x, y, viewportWidth, viewportHeight),
            }}
            onClick={(e) => e.stopPropagation()}
        >
            {children}
        </div>
    );
};
