import {useEffect, useState} from 'react'
import {
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    Checkbox,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    List,
    ListItemButton,
    ListItemText,
    Typography
} from '@mui/material'
import {
    ArrowBack as ArrowBackIcon,
    Delete as DeleteIcon,
    PowerSettingsNew as PowerIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material'
import {useNavigate} from 'react-router-dom'
import {execute} from '../../plugins/execute'

interface Action {
    name: string
    icon: JSX.Element
    color?: string
    action: () => void
    requireSelected?: boolean
}

export const PackageManager = () => {
    const navigate = useNavigate()
    const [apps, setApps] = useState<string[]>([])
    const [selected, setSelected] = useState<string | null>(null)
    const [disabledApps, setDisabledApps] = useState<string[]>([])
    const [showSystem, setShowSystem] = useState(false)
    const [loading, setLoading] = useState(true)
    const [dialog, setDialog] = useState(false)
    const [dialogMessage, setDialogMessage] = useState('')

    const getInstalled = async (flags = '') => {
        const data = await execute(`adb shell pm list packages ${flags}`)
        return data
            .split('\r\n')
            .map(line => line.split('package:')[1])
            .filter(Boolean)
    }

    const rebuild = async () => {
        setLoading(true)
        try {
            const installedApps = await getInstalled(showSystem ? '-s' : '-3')
            const disabledList = await getInstalled('-d')
            setApps(installedApps)
            setDisabledApps(disabledList)
            setSelected(null)
        } catch (error) {
            setDialogMessage(error as string)
            setDialog(true)
        }
        setLoading(false)
    }

    const uninstall = async () => {
        if (!selected) return
        try {
            await execute(`adb shell pm uninstall ${selected}`)
            setDialogMessage('Package uninstalled successfully')
            setDialog(true)
            rebuild()
        } catch (error) {
            setDialogMessage(error as string)
            setDialog(true)
        }
    }

    const disable = async () => {
        if (!selected) return
        try {
            const isDisabled = disabledApps.includes(selected)
            await execute(`adb shell pm ${isDisabled ? 'enable' : 'disable-user'} ${selected}`)
            setDialogMessage(`Package ${isDisabled ? 'enabled' : 'disabled'} successfully`)
            setDialog(true)
            rebuild()
        } catch (error) {
            setDialogMessage(error as string)
            setDialog(true)
        }
    }

    const actions: Action[] = [
        {
            name: 'Refresh',
            icon: <RefreshIcon />,
            action: () => rebuild(),
            requireSelected: false
        },
        {
            name: 'Uninstall',
            icon: <DeleteIcon />,
            color: 'red',
            action: uninstall
        },
        {
            name: 'Disable',
            icon: <PowerIcon />,
            color: 'orange',
            action: disable
        }
    ]

    useEffect(() => {
        rebuild()
    }, [showSystem])

    return (
        <Box sx={{ p: 2 }}>
            <Card sx={{ position: 'fixed', top: '2em', width: '100%', zIndex: 10 }}>
                <CardHeader
                    title={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <ArrowBackIcon
                                onClick={() => navigate(-1)}
                                sx={{ cursor: 'pointer', mr: 1 }}
                            />
                            Package Manager
                        </Box>
                    }
                />
                <CardContent>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        {actions.map((action, index) => (
                            <Button
                                key={index}
                                variant="outlined"
                                onClick={action.action}
                                disabled={!selected && action.requireSelected !== false}
                                sx={selected && action.color ? {
                                    borderColor: action.color,
                                    color: action.color
                                } : {}}
                                startIcon={action.icon}
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
                    />
                </CardContent>
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
                <List sx={{ mt: '12em' }}>
                    {apps.map((app, index) => (
                        <ListItemButton
                            key={index}
                            selected={selected === app}
                            onClick={() => setSelected(app)}
                        >
                            <ListItemText
                                primary={app}
                                secondary={disabledApps.includes(app) ? 'Disabled' : ''}
                            />
                        </ListItemButton>
                    ))}
                </List>
            )}

            <Dialog open={dialog} onClose={() => setDialog(false)}>
                <DialogTitle>Complete</DialogTitle>
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