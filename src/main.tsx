import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.layer.css";

import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
    <MantineProvider theme={{ focusRing: "never" }} defaultColorScheme="dark">
        <StrictMode>
            <App />
        </StrictMode>
    </MantineProvider>
);
