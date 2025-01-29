import { ActionIcon, Dialog, SegmentedControl } from "@mantine/core";

import classes from "./Toolbar.module.css";
import { IconPointer, IconSquare, IconTriangle } from "@tabler/icons-react";

interface ToolbarProps {
    //
}

export const Toolbar = ({}: ToolbarProps) => {
    return (
        <>
            <Dialog position={{ top: 20, left: 20 }} p={0} w="100%" opened>
                <SegmentedControl
                    transitionDuration={100}
                    orientation="vertical"
                    classNames={{ label: classes.label }}
                    withItemsBorders={false}
                    data={[
                        {
                            value: "preview",
                            label: (
                                <ActionIcon size="lg" variant="transparent" component="span">
                                    <IconPointer
                                        style={{ width: "60%", height: "60%" }}
                                        stroke={1.5}
                                    />
                                </ActionIcon>
                            ),
                        },
                        {
                            value: "code",
                            label: (
                                <ActionIcon size="lg" variant="transparent" component="span">
                                    <IconTriangle
                                        style={{ width: "60%", height: "60%" }}
                                        stroke={1.5}
                                    />
                                </ActionIcon>
                            ),
                        },
                        {
                            value: "export",
                            label: (
                                <ActionIcon size="lg" variant="transparent" component="span">
                                    <IconSquare
                                        style={{ width: "60%", height: "60%" }}
                                        stroke={1.5}
                                    />
                                </ActionIcon>
                            ),
                        },
                    ]}
                />
            </Dialog>
        </>
    );
};
