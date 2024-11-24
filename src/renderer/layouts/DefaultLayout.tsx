import { useEffect, useState } from "react";
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, useTheme } from "@mui/material";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Apps as AppsIcon,
  Folder as FolderIcon,
  Home as HomeIcon,
  Settings as SettingsIcon,
  Wifi as WifiIcon
} from "@mui/icons-material";
import icon from "../assets/icon.png";

interface NavItem {
    title: string;
    path: string;
    icon: JSX.Element;
}

const navItems: NavItem[] = [
    { title: 'Home', path: '/', icon: <HomeIcon /> },
    { title: 'Wireless Setup', path: '/wireless-setup', icon: <WifiIcon /> },
    { title: 'Apps Manager', path: '/tools/apps', icon: <AppsIcon /> },
    { title: 'File Manager', path: '/tools/files', icon: <FolderIcon /> },
    { title: 'Settings', path: '/settings', icon: <SettingsIcon /> },
];

const DRAWER_WIDTH = 240;

export const DefaultLayout = () => {
    const [platform, setPlatform] = useState<string>('');
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const userAgent = navigator.userAgent.toLowerCase();
        if (userAgent.includes('mac')) {
            setPlatform('darwin');
        } else if (userAgent.includes('win')) {
            setPlatform('win32');
        } else if (userAgent.includes('linux')) {
            setPlatform('linux');
        }
    }, []);

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            {/* Sidebar */}
            <Drawer
                variant="permanent"
                sx={{
                    width: DRAWER_WIDTH,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: DRAWER_WIDTH,
                        boxSizing: 'border-box',
                        background: '#1C1B1F',
                        borderRight: '1px solid rgba(255,255,255,0.1)',
                    },
                }}
            >
                {/* App Title */}
                <Box
                    sx={{
                        WebkitAppRegion: 'drag',
                        p: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1,
                        borderBottom: '1px solid rgba(255,255,255,0.1)',
                    }}
                >
                    <img
                        src={icon}
                        style={{
                            height: '24px',
                        }}
                        alt="SCRCPY CONTROL"
                    />
                    <span style={{ fontSize: '1.2rem', color: 'white' }}>SCRCPY CONTROL</span>
                </Box>

                {/* Navigation Items */}
                <List>
                    {navItems.map((item) => (
                        <ListItem key={item.path} disablePadding>
                            <ListItemButton
                                selected={location.pathname === item.path}
                                onClick={() => navigate(item.path)}
                                sx={{
                                    my: 0.5,
                                    mx: 1,
                                    borderRadius: 1,
                                    '&.Mui-selected': {
                                        backgroundColor: 'rgba(136, 103, 192, 0.2)',
                                        '&:hover': {
                                            backgroundColor: 'rgba(136, 103, 192, 0.3)',
                                        }
                                    },
                                }}
                            >
                                <ListItemIcon sx={{
                                    minWidth: 40,
                                    color: location.pathname === item.path ? theme.palette.primary.main : 'inherit'
                                }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.title}
                                    primaryTypographyProps={{
                                        sx: {
                                            color: location.pathname === item.path ? theme.palette.primary.main : 'inherit'
                                        }
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Drawer>

            {/* Main Content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    background: '#1C1B1F',
                    minHeight: '100vh',
                    '& section': {
                        border: '2px solid #38373A',
                        borderRadius: '1.5em',
                        margin: '2em',
                        padding: '1em'
                    },
                    '& .highlight': {
                        background: '#999',
                        borderRadius: '3px'
                    },
                    '& .primaryButton': {
                        border: `2px solid ${theme.palette.primary.main}`
                    },
                    '& .MuiButton-root': {
                        boxShadow: 'none',
                        background: 'none',
                        border: '2px solid rgba(255,255,255,0.1)',
                        '&:hover': {
                            background: 'rgba(255,255,255,0.05)'
                        }
                    },
                    '& ::-webkit-scrollbar': {
                        width: '0.25em'
                    },
                    '& ::-webkit-scrollbar-thumb': {
                        backgroundColor: '#8867c0',
                        borderRadius: '1em',
                        WebkitAppRegion: 'drag'
                    },
                    '& p': {
                        wordBreak: 'break-word'
                    }
                }}
            >
                {/* Title bar drag area for Windows/Linux */}
                {platform !== 'darwin' && (
                    <Box
                        sx={{
                            WebkitAppRegion: 'drag',
                            height: '32px',
                            background: '#1C1B1F',
                            width: '100%'
                        }}
                    />
                )}

                {/* Page Content */}
                <Outlet />
            </Box>
        </Box>
    );
};