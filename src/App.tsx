import { useState } from "react";
import "./App.css";

import { Canvas, Toolbar } from "./scenes";

// ref: https://stackoverflow.com/a/66859957
const tools = ["move-tool", "triangle", "rectangle", "circle", "hand-tool"] as const;
export type Tool = (typeof tools)[number];

export function isTool(str: string): str is Tool {
    return tools.some((tool) => str === tool);
}

const App = () => {
    const [tool, setTool] = useState<Tool>("move-tool");

    return (
        <>
            <Canvas tool={tool} setTool={setTool} />
            <Toolbar tool={tool} setTool={setTool} />
        </>
    );
};

export default App;
