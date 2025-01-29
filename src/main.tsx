import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MantineProvider } from "@mantine/core";

import App from "./App.tsx";
import "@mantine/core/styles.layer.css";
import "./index.css";

createRoot(document.getElementById("root")!).render(
    <MantineProvider defaultColorScheme="dark">
        <StrictMode>
            <App />
        </StrictMode>
    </MantineProvider>
);
