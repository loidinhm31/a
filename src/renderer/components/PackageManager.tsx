import { useState } from "react";
import {
  Box,
  Button,
  Card,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import { execute } from "../plugins/execute";

interface Action {
    name: string
    icon: string
    color?: string
    requireSelected: boolean
    action: () => void
}

interface App {
    name: string
    package: string
    system: boolean
}

export const PackageManager = () => {
    const navigate = useNavigate()
    const [apps, setApps] = useState<App[]>([])
    const [selected, setSelected] = useState<App | null>(null)
    const [showSystem, setShowSystem] = useState(false)
    const [loading, setLoading] = useState(false)
    const [dialog, setDialog] = useState(false)
    const [dialogMessage, setDialogMessage] = useState('')

    const actions: Action[] = [
        {
            name: 'Refresh',
            icon: 'mdi-refresh',
            requireSelected: false,
            action: () => refreshApps()
        },
        {
            name: 'Uninstall',
            icon: 'mdi-delete',
            color: '#b71c1c',
            requireSelected: true,
            action: () => uninstallApp()
        },
        {
            name: 'Disable',
            icon: 'mdi-power',
            requireSelected: true,
            action: () => toggleApp()
        }
    ]

    const refreshApps = async () => {
        console.log("calling refresh apps")
        setLoading(true)
        try {
            const result = await execute('adb shell pm list packages -f')
            const appList = result.split('\n')
                .filter(line => line.trim())
                .map(line => {
                    const parts = line.split('=')
                    const pkg = parts[1]
                    return {
                        name: pkg.split('.').pop() || pkg,
                        package: pkg,
                        system: false // You might want to check this with another command
                    }
                })
            setApps(appList)
        } catch (error) {
            console.error(error)
        }
        setLoading(false)
    }

    const uninstallApp = async () => {
        if (!selected) return
        try {
            await execute(`adb uninstall ${selected.package}`)
            setDialogMessage(`Successfully uninstalled ${selected.name}`)
            setDialog(true)
            refreshApps()
        } catch (error) {
            setDialogMessage(`Failed to uninstall: ${error}`)
            setDialog(true)
        }
    }

    const toggleApp = async () => {
        if (!selected) return
        try {
            await execute(`adb shell pm disable ${selected.package}`)
            setDialogMessage(`Successfully disabled ${selected.name}`)
            setDialog(true)
            refreshApps()
        } catch (error) {
            setDialogMessage(`Failed to disable: ${error}`)
            setDialog(true)
        }
    }

    return (
        <Box>
            <Card
                sx={{
                    position: 'fixed',
                    top: '2em',
                    width: '100%',
                    zIndex: 10,
                    bgcolor: 'grey.900'
                }}
            >
                <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate(-1)}
                    >
                        Package Manager
                    </Button>
                </Box>

                <Box sx={{ px: 2, display: 'flex', gap: 1 }}>
                    {actions.map((action, index) => (
                        <Button
                            key={index}
                            variant="contained"
                            startIcon={<span className="material-icons">{action.icon}</span>}
                            onClick={action.action}
                            disabled={action.requireSelected && !selected}
                            sx={action.color ? {
                                borderColor: action.color,
                                borderWidth: selected ? 2 : 0,
                                borderStyle: 'solid'
                            } : {}}
                        >
                            {action.name}
                        </Button>
                    ))}
                </Box>

                <FormControlLabel
                    control={
                        <Checkbox
                            checked={showSystem}
                            onChange={(e) => setShowSystem(e.target.checked)}
                        />
                    }
                    label="Show System Apps"
                    sx={{ ml: 2, mb: 1 }}
                />
            </Card>

            {loading ? (
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)'
                }}>
                    <CircularProgress />
                </Box>
            ) : (
                <List sx={{ mt: '8em' }}>
                    {apps
                        .filter(app => showSystem || !app.system)
                        .map((app, index) => (
                            <ListItem key={index} disablePadding>
                                <ListItemButton
                                    selected={selected?.package === app.package}
                                    onClick={() => setSelected(app)}
                                >
                                    <ListItemText
                                        primary={app.name}
                                        secondary={app.package}
                                    />
                                </ListItemButton>
                            </ListItem>
                        ))}
                </List>
            )}

            <Dialog open={dialog} onClose={() => setDialog(false)}>
                <DialogTitle>Complete</DialogTitle>
                <DialogContent>
                    <Typography>{dialogMessage}</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialog(false)}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}