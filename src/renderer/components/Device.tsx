import {useState, useEffect} from 'react'
import {Box, Typography, Button, CircularProgress, IconButton, Stack} from '@mui/material'
import {Link, useNavigate} from 'react-router-dom'
import {execute} from '../plugins/execute'
import {Refresh} from '@mui/icons-material'

interface DeviceInfo {
    title: string
    icon: string
    command: string
    data: string | null
    subCommand?: string
    subData?: string | null
    subDataPrepend?: string
}

export const Device = ({onDeviceChange}: { onDeviceChange: (connected: boolean) => void }) => {
    const navigate = useNavigate()
    const [device, setDevice] = useState(false)
    const [loading, setLoading] = useState(true)
    const [deviceInfo, setDeviceInfo] = useState<DeviceInfo[]>([
        {
            title: "Model",
            icon: "mdi-devices",
            command: "adb shell getprop ro.product.model",
            data: null,
            subCommand: "adb shell getprop ro.product.device",
            subData: null,
        },
        {
            title: "Android Version",
            icon: "mdi-android",
            command: "adb shell getprop ro.build.version.release",
            data: null,
            subCommand: "adb shell getprop ro.build.version.sdk",
            subData: null,
            subDataPrepend: "API "
        },
        {
            title: "System Build Number",
            icon: "mdi-wrench",
            command: "adb shell getprop ro.build.id",
            data: null,
        },
        {
            title: "Security Patch",
            icon: "mdi-security",
            command: "adb shell getprop ro.build.version.security_patch",
            data: null,
        },
    ])

    const checkDevice = async () => {
        try {
            if (!window.electron) {
                console.error('Electron not available')
                setDevice(false)
                onDeviceChange(false)
                return
            }

            const data = await execute("adb devices -l")
            const isConnected = data.includes("product:")
            setDevice(isConnected)
            onDeviceChange(isConnected)

            if (isConnected && !device) {
                refreshList()
            } else {
                setLoading(false)
            }
        } catch (error) {
            console.error('Error checking device:', error)
            setDevice(false)
            onDeviceChange(false)
            setLoading(false)
        }
    }

    const refreshList = async () => {
        setLoading(true)
        try {
            const updatedInfo = await Promise.all(
                deviceInfo.map(async (item) => {
                    const data = await execute(item.command)
                    const newItem = {...item, data: data.trim()}

                    if (item.subCommand) {
                        const subData = await execute(item.subCommand)
                        newItem.subData = subData.trim()
                    }

                    return newItem
                })
            )
            setDeviceInfo(updatedInfo)
        } catch (error) {
            console.error('Error refreshing device info:', error)
        }
        setLoading(false)
    }

    const handleRefresh = () => {
        checkDevice()
    }

    useEffect(() => {
        // Initial check when component mounts
        checkDevice()
    }, [])

    return (
        <Box sx={{p: 2}}>
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{mb: 2}}
            >
                <Typography variant="h6">Device</Typography>
                <IconButton
                    onClick={handleRefresh}
                    disabled={loading}
                    color="primary"
                    size="small"
                >
                    <Refresh/>
                </IconButton>
            </Stack>

            {!device ? (
                <Box sx={{textAlign: 'center'}}>
                    <Typography variant="h5">No Device Found</Typography>
                    <Typography color="text.secondary" sx={{mb: 2}}>
                        You may need to plug in your device or enable 'USB Debugging'
                    </Typography>
                    <Typography sx={{mb: 2}}>or</Typography>
                    <Button
                        onClick={() => navigate('/wireless-setup')}
                        variant="contained"
                        color="primary"
                    >
                        Connect Wirelessly
                    </Button>
                </Box>
            ) : (
                <>
                    {loading ? (
                        <Box sx={{display: 'flex', justifyContent: 'center', p: 3}}>
                            <CircularProgress/>
                        </Box>
                    ) : (
                        device && deviceInfo.map((item, index) => (
                            <Box
                                key={index}
                                sx={{
                                    my: 1,
                                    p: 1.5,
                                    borderRadius: 1,
                                    '&:hover': {
                                        bgcolor: 'action.hover'
                                    }
                                }}
                            >
                                <Typography variant="subtitle1">
                                    {item.title}
                                </Typography>
                                <Typography color="text.secondary">
                                    {item.data}
                                    {item.subData && ` (${item.subDataPrepend || ''}${item.subData})`}
                                </Typography>
                            </Box>
                        ))
                    )}
                </>
            )}
        </Box>
    )
}