import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Link,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  ArrowBackIosNew as NavigateBackIcon,
  ArrowForwardIos as NavigateForwardIcon,
  ArrowUpward as ArrowUpwardIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Folder as FolderIcon,
  InsertDriveFile as FileIcon
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { execute } from "@/plugins/execute.ts";
import { fileManager } from "@/plugins/fileManager.ts";

interface FileItem {
  name: string;
  isDirectory: boolean;
  path: string;
}

interface NavigationHistory {
  paths: string[];
  currentIndex: number;
}

export const FileManager = () => {
  const navigate = useNavigate();
  const [currentPath, setCurrentPath] = useState("/sdcard/");
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<FileItem | null>(null);
  const [dialog, setDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [deviceError, setDeviceError] = useState<string | null>(null);
  const [history, setHistory] = useState<NavigationHistory>({
    paths: ["/sdcard/"],
    currentIndex: 0
  });

  const checkDevice = async () => {
    try {
      const result = await execute("adb devices");
      const devices = result.split("\n")
        .filter(line => line && !line.startsWith("List"))
        .map(line => line.split("\t")[0])
        .filter(Boolean);

      if (devices.length === 0) {
        throw new Error("No devices connected");
      }
      setDeviceError(null);
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setDeviceError(message);
      setFiles([]);
      return false;
    }
  };

  const loadFiles = async (path: string) => {
    setLoading(true);
    setFiles([]); // Clear current files before loading
    try {
      const deviceConnected = await checkDevice();
      if (!deviceConnected) {
        setLoading(false);
        return;
      }

      const dir = await fileManager.getDir(path);
      const newFiles: FileItem[] = [];

      if (dir.directories) {
        for (const name of dir.directories) {
          if (name === "" || name === "*/: No such file or directory") continue;
          newFiles.push({
            name,
            path: `${path}${name}/`.replace(/\/+/g, "/"), // Normalize path
            isDirectory: true
          });
        }
      }
      if (dir.files) {
        for (const name of dir.files) {
          if (name === "" || name === "*.*: No such file or directory") continue;
          newFiles.push({
            name,
            path: `${path}${name}`.replace(/\/+/g, "/"), // Normalize path
            isDirectory: false
          });
        }
      }

      setFiles(newFiles);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setDialogMessage(message);
      setDialog(true);
    }
    setLoading(false);
  };

  const navigateToPath = (path: string, addToHistory = true) => {
    if (addToHistory) {
      // Remove any forward history when adding new path
      const newPaths = history.paths.slice(0, history.currentIndex + 1);
      setHistory({
        paths: [...newPaths, path],
        currentIndex: newPaths.length
      });
    }
    setCurrentPath(path);
    setSelected(null);
    loadFiles(path);
  };

  const navigateBack = () => {
    if (history.currentIndex > 0) {
      const newIndex = history.currentIndex - 1;
      setHistory(prev => ({
        ...prev,
        currentIndex: newIndex
      }));
      navigateToPath(history.paths[newIndex], false);
    }
  };

  const navigateForward = () => {
    if (history.currentIndex < history.paths.length - 1) {
      const newIndex = history.currentIndex + 1;
      setHistory(prev => ({
        ...prev,
        currentIndex: newIndex
      }));
      navigateToPath(history.paths[newIndex], false);
    }
  };

  const downloadFile = async () => {
    if (!selected) return;
    try {
      const deviceConnected = await checkDevice();
      if (!deviceConnected) return;

      await execute(`adb pull "${selected.path}" .`);
      setDialogMessage("File downloaded successfully");
      setDialog(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setDialogMessage(message);
      setDialog(true);
    }
  };

  const deleteFile = async () => {
    if (!selected) return;
    try {
      const deviceConnected = await checkDevice();
      if (!deviceConnected) return;

      await execute(`adb shell rm ${selected.isDirectory ? "-r" : ""} "${selected.path}"`);
      loadFiles(currentPath);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setDialogMessage(message);
      setDialog(true);
    }
  };

  useEffect(() => {
    loadFiles(currentPath);
  }, []);

  const pathParts = currentPath.split("/").filter(Boolean);

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 1 }}>
        <ArrowBackIcon
          onClick={() => navigate(-1)}
          sx={{ cursor: "pointer" }}
        />
        <Typography variant="h6" sx={{ flex: 1 }}>File Manager</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="Navigate Back">
                        <span>
                            <IconButton
                              onClick={navigateBack}
                              disabled={history.currentIndex <= 0}
                            >
                                <NavigateBackIcon />
                            </IconButton>
                        </span>
          </Tooltip>
          <Tooltip title="Navigate Forward">
                        <span>
                            <IconButton
                              onClick={navigateForward}
                              disabled={history.currentIndex >= history.paths.length - 1}
                            >
                                <NavigateForwardIcon />
                            </IconButton>
                        </span>
          </Tooltip>
        </Box>
      </Box>

      {deviceError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {deviceError}
        </Alert>
      )}

      <Breadcrumbs sx={{ mb: 2 }}>
        {pathParts.map((part, index) => (
          <Link
            key={index}
            component="button"
            onClick={() => navigateToPath(`/${pathParts.slice(0, index + 1).join("/")}/`)}
            underline="hover"
          >
            {part}
          </Link>
        ))}
      </Breadcrumbs>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", m: 2 }}>
          <CircularProgress />
        </Box>
      ) : (
        <List>
          {currentPath !== "/storage" && (
            <ListItemButton
              onClick={() => navigateToPath(currentPath.split("/").slice(0, -2).join("/") + "/")}>
              <ListItemIcon>
                <ArrowUpwardIcon />
              </ListItemIcon>
              <ListItemText primary=".." />
            </ListItemButton>
          )}
          {files.map((file, index) => (
            <ListItemButton
              key={index}
              selected={selected?.path === file.path}
              onClick={() => file.isDirectory ? navigateToPath(file.path) : setSelected(file)}
            >
              <ListItemIcon>
                {file.isDirectory ? <FolderIcon /> : <FileIcon />}
              </ListItemIcon>
              <ListItemText sx={{ color: "white" }} primary={file.name} />
              {!file.isDirectory && selected?.path === file.path && (
                <Box>
                  <IconButton onClick={downloadFile}>
                    <DownloadIcon />
                  </IconButton>
                  <IconButton onClick={deleteFile} color="error">
                    <DeleteIcon />
                  </IconButton>
                </Box>
              )}
            </ListItemButton>
          ))}
        </List>
      )}

      <Dialog open={dialog} onClose={() => setDialog(false)}>
        <DialogTitle>Notice</DialogTitle>
        <DialogContent>
          <Typography>{dialogMessage}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};