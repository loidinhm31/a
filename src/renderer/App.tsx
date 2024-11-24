import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { createHashRouter, RouterProvider } from "react-router-dom";
import { DefaultLayout } from "./layouts/DefaultLayout";
import { Home } from "@/pages/Home";
import { PackageManager } from "@/components/PackageManager";
import { FileManager } from "@/pages/tools/FileManager";
import { Settings } from "@/pages/Settings";
import { WirelessSetup } from "@/pages/WirelessSetup";

export const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#8867c0',
        },
        background: {
            default: '#1C1B1F',
            paper: '#1C1B1F',
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                },
            },
        },
        MuiIconButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                },
            },
        },
    },
});

const router = createHashRouter([
    {
        path: "/",
        element: <DefaultLayout />,
        children: [
            {
                index: true,
                element: <Home />
            },
            {
                path: "wireless-setup",
                element: <WirelessSetup />
            },
            {
                path: "tools/apps",
                element: <PackageManager />
            },
            {
                path: "tools/files",
                element: <FileManager />
            },
            {
                path: "settings",
                element: <Settings />
            }
        ]
    }
]);

export const App = () => {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <RouterProvider router={router} />
        </ThemeProvider>
    );
};

export default App;