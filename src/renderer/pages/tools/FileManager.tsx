import { useState, useEffect } from 'react'
import {
    Box,
    Typography,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    IconButton,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    Breadcrumbs,
    Link,
    Alert
} from '@mui/material'
import {
    Folder as FolderIcon,
    InsertDriveFile as FileIcon,
    ArrowBack as ArrowBackIcon,
    ArrowUpward as ArrowUpwardIcon,
    Download as DownloadIcon,
    Delete as DeleteIcon
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { execute } from '@/plugins/execute.ts'

interface FileItem {
    name: string
    isDirectory: boolean
    path: string
}

export const FileManager = () => {
    const navigate = useNavigate()
    const [currentPath, setCurrentPath] = useState('/storage')
    const [files, setFiles] = useState<FileItem[]>([])
    const [loading, setLoading] = useState(true)
    const [selected, setSelected] = useState<FileItem | null>(null)
    const [dialog, setDialog] = useState(false)
    const [dialogMessage, setDialogMessage] = useState('')
    const [deviceError, setDeviceError] = useState<string | null>(null)

    const checkDevice = async () => {
        try {
            const result = await execute('adb devices')
            const devices = result.split('\n')
                .filter(line => line && !line.startsWith('List'))
                .map(line => line.split('\t')[0])
                .filter(Boolean)

            if (devices.length === 0) {
                throw new Error('No devices connected')
            }
            setDeviceError(null)
            return true
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error)
            setDeviceError(message)
            setFiles([])
            return false
        }
    }

    const loadFiles = async (path: string) => {
        setLoading(true)
        try {
            const deviceConnected = await checkDevice()
            if (!deviceConnected) {
                setLoading(false)
                return
            }

            const result = await execute(`adb shell ls -l ${path}`)
            const fileList = result.split('\n')
                .filter(line => line.trim())
                .map(line => {
                    const parts = line.split(/\s+/)
                    const name = parts.slice(8).join(' ')
                    const isDirectory = line.startsWith('d')
                    return {
                        name,
                        isDirectory,
                        path: `${path}/${name}`
                    }
                })
            setFiles(fileList)
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error)
            setDialogMessage(message)
            setDialog(true)
        }
        setLoading(false)
    }

    const navigateToPath = (path: string) => {
        setCurrentPath(path)
        loadFiles(path)
    }

    const downloadFile = async () => {
        if (!selected) return
        try {
            const deviceConnected = await checkDevice()
            if (!deviceConnected) return

            await execute(`adb pull "${selected.path}" .`)
            setDialogMessage('File downloaded successfully')
            setDialog(true)
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error)
            setDialogMessage(message)
            setDialog(true)
        }
    }

    const deleteFile = async () => {
        if (!selected) return
        try {
            const deviceConnected = await checkDevice()
            if (!deviceConnected) return

            await execute(`adb shell rm ${selected.isDirectory ? '-r' : ''} "${selected.path}"`)
            loadFiles(currentPath)
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error)
            setDialogMessage(message)
            setDialog(true)
        }
    }

    useEffect(() => {
        loadFiles(currentPath)
    }, [])

    const pathParts = currentPath.split('/').filter(Boolean)

    return (
        <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ArrowBackIcon
                    onClick={() => navigate(-1)}
                    sx={{ cursor: 'pointer', mr: 1 }}
                />
                <Typography variant="h6">File Manager</Typography>
            </Box>

            {deviceError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {deviceError}
                </Alert>
            )}

            <Breadcrumbs sx={{ mb: 2 }}>
                <Link
                    component="button"
                    onClick={() => navigateToPath('/storage')}
                    underline="hover"
                >
                    storage
                </Link>
                {pathParts.map((part, index) => (
                    <Link
                        key={index}
                        component="button"
                        onClick={() => navigateToPath(`/${pathParts.slice(0, index + 1).join('/')}`)}
                        underline="hover"
                    >
                        {part}
                    </Link>
                ))}
            </Breadcrumbs>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', m: 2 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <List>
                    {currentPath !== '/storage' && (
                        <ListItemButton onClick={() => navigateToPath(currentPath.split('/').slice(0, -1).join('/'))}>
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
                            <ListItemText primary={file.name} />
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
    )
}