import { useEffect, useState } from "react";
import { Box, Button, CircularProgress, IconButton, Stack, SvgIcon, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { execute } from "../plugins/execute";
import {
  Android as AndroidIcon,
  Build as BuildIcon,
  Devices as DevicesIcon,
  Refresh,
  Security as SecurityIcon
} from "@mui/icons-material";

interface DeviceInfo {
    title: string
    icon: typeof DevicesIcon  // This ensures correct typing for MUI icons
    command: string
    data: string | null
    subCommand?: string
    subData?: string | null
    subDataPrepend?: string
}

export const Device = ({onDeviceChange}: { onDeviceChange: (connected: boolean) => void }) => {
    const navigate = useNavigate()
    const [device, setDevice] = useState(false)
    const [deviceSerial, setDeviceSerial] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [deviceInfo, setDeviceInfo] = useState<DeviceInfo[]>([
        {
            title: "Model",
            icon: DevicesIcon,
            command: "adb shell getprop ro.product.model",
            data: null,
            subCommand: "adb shell getprop ro.product.device",
            subData: null,
        },
        {
            title: "Android Version",
            icon: AndroidIcon,
            command: "adb shell getprop ro.build.version.release",
            data: null,
            subCommand: "adb shell getprop ro.build.version.sdk",
            subData: null,
            subDataPrepend: "API "
        },
        {
            title: "System Build Number",
            icon: BuildIcon,
            command: "adb shell getprop ro.build.id",
            data: null,
        },
        {
            title: "Security Patch",
            icon: SecurityIcon,
            command: "adb shell getprop ro.build.version.security_patch",
            data: null,
        },
    ])

    const parseDevicesList = (output: string) => {
        const lines = output.split('\n').filter(line => line.trim())
        for (const line of lines) {
            // Skip empty lines and "List of devices attached"
            if (!line || line.includes('List of devices attached')) continue

            // Check if device is properly connected (not offline)
            if (line.includes('device') && !line.includes('offline')) {
                // Extract the device serial/IP - it's the first part before any whitespace
                const serial = line.split(/\s+/)[0]
                return { connected: true, serial }
            }
        }
        return { connected: false, serial: null }
    }

    const checkDevice = async () => {
        try {
            if (!window.electron) {
                console.error('Electron not available')
                setDevice(false)
                onDeviceChange(false)
                return
            }

            const data = await execute("adb devices -l")
            const { connected, serial } = parseDevicesList(data)

            setDevice(connected)
            setDeviceSerial(serial)
            onDeviceChange(connected)

            if (connected && serial) {
                refreshList(serial)
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

    const refreshList = async (serial: string) => {
        setLoading(true)
        try {
            const updatedInfo = await Promise.all(
                deviceInfo.map(async (item) => {
                    // Modify commands to target specific device
                    const deviceCommand = `adb -s ${serial} ${item.command.replace('adb ', '')}`
                    const data = await execute(deviceCommand)
                    const newItem = {...item, data: data.trim()}

                    if (item.subCommand) {
                        const deviceSubCommand = `adb -s ${serial} ${item.subCommand.replace('adb ', '')}`
                        const subData = await execute(deviceSubCommand)
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
                                    display: 'flex',
                                    alignItems: 'center',
                                    '&:hover': {
                                        bgcolor: 'action.hover'
                                    }
                                }}
                            >
                                <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                                    <SvgIcon component={item.icon} sx={{ fontSize: 20 }} />
                                </Box>
                                <Box>
                                    <Typography variant="subtitle1">
                                        {item.title}
                                    </Typography>
                                    <Typography color="text.secondary">
                                        {item.data}
                                        {item.subData && ` (${item.subDataPrepend || ''}${item.subData})`}
                                    </Typography>
                                </Box>
                            </Box>
                        ))
                    )}
                </>
            )}
        </Box>
    )
}