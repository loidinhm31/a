import { BrowserWindow, screen } from "electron";
import path from "path";

export function createWindow() {
  // Get primary display dimensions for centering
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;

  const windowWidth = 720;
  const windowHeight = 700;

  const mainWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    minWidth: 720,
    minHeight: 500, // Added minimum height
    x: Math.floor((screenWidth - windowWidth) / 2),
    y: Math.floor((screenHeight - windowHeight) / 2),
    autoHideMenuBar: true,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#1C1B1F',
      symbolColor: '#8867c0',
      height: 28 // Explicitly set overlay height for consistency
    },
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload/index.js'),
      sandbox: true, // Enable sandbox for additional security
      spellcheck: true, // Enable spellcheck
      // Disable various potentially dangerous features
      webSecurity: true,
      allowRunningInsecureContent: false,
      experimentalFeatures: false
    },
    // Improve window behavior
    show: false, // Don't show until ready
    backgroundColor: '#1C1B1F' // Match titlebar color to prevent flash
  });

  // Show window when ready to prevent flashing
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle window state
  mainWindow.on('unresponsive', () => {
    console.log('Window became unresponsive');
  });

  mainWindow.on('responsive', () => {
    console.log('Window became responsive again');
  });

  // Load the appropriate content
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || 5173;
    mainWindow.loadURL(`http://localhost:${port}`).catch(err => {
      console.error('Failed to load dev server:', err);
    });
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html')).catch(err => {
      console.error('Failed to load production file:', err);
    });
  }

  return mainWindow;
}