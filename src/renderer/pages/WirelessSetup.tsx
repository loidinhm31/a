import { useState, useEffect } from 'react'
import {
    Box,
    Typography,
    TextField,
    Button,
    Alert,
    Icon,
    LinearProgress,
    CircularProgress
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import PhoneCheckIcon from '@mui/icons-material/PhoneAndroid'
import { useNavigate } from 'react-router-dom'
import { execute } from '../plugins/execute'
import OtpInput from 'react-otp-input'

interface DeviceInfo {
    ip: string;
    port: string;
    model?: string;
}

export const WirelessSetup = () => {
    const navigate = useNavigate()
    const [step, setStep] = useState(0)
    const [pairCode, setPairCode] = useState('')
    const [ip, setIp] = useState('')
    const [ip2, setIp2] = useState('')
    const [pairingLoading, setPairingLoading] = useState(false)
    const [connectingLoading, setConnectingLoading] = useState(false)
    const [pairingNotice, setPairingNotice] = useState<string | null>(null)
    const [connectingNotice, setConnectingNotice] = useState('')
    const [discoveredDevices, setDiscoveredDevices] = useState<DeviceInfo[]>([])
    const [isDiscovering, setIsDiscovering] = useState(false)

    const discoverDevices = async () => {
        setIsDiscovering(true)
        setPairingNotice(null)

        try {
            // Get mDNS services using adb mdns services command
            const result = await execute('adb mdns services')

            // Parse the output to extract services information
            const devices = parseAdbMdnsServicesOutput(result)
            setDiscoveredDevices(devices)

            // If we found any devices, auto-fill the first one's IP
            if (devices.length > 0) {
                if (step === 0) {
                    // For first step, only set IP without port
                    setIp(devices[0].ip + ":")
                } else {
                    // For second step, set full IP:port
                    setIp2(`${devices[0].ip}:${devices[0].port}`)
                }
            }
        } catch (error) {
            setPairingNotice(`Failed to discover devices: ${error}`)
        } finally {
            setIsDiscovering(false)
        }
    }

    const parseAdbMdnsServicesOutput = (output: string): DeviceInfo[] => {
        // Skip the first line which is "List of discovered mdns services"
        const lines = output.split('\n').slice(1);
        const devicesMap = new Map<string, DeviceInfo>();

        lines.forEach(line => {
            // Skip empty lines
            if (!line.trim()) return;

            // Example line: "adb-R58RA3M63HZ-TJb2Zx  *adb-tls-connect.*tcp   192.168.1.126:39749"
            const parts = line.split(/\s+/).filter(Boolean);

            if (parts.length >= 3) {
                const deviceId = parts[0];
                const ipPortString = parts[parts.length - 1]; // Get the last part which is IP:port
                const [ip, port] = ipPortString.split(':');

                // Only add unique devices (using deviceId as key)
                if (!devicesMap.has(deviceId)) {
                    devicesMap.set(deviceId, {
                        ip,
                        port,
                        // Extract device ID without the 'adb-' prefix
                        model: deviceId.startsWith('adb-') ? deviceId.substring(4) : deviceId
                    });
                }
            }
        });

        // Convert Map to array
        return Array.from(devicesMap.values());
    };

    // Auto-discover devices when component mounts and when step changes
    useEffect(() => {
        discoverDevices()
    }, [step])

    const pair = async () => {
        if (!ip || !pairCode) return

        setPairingLoading(true)
        try {
            const data = await execute(`adb pair ${ip} ${pairCode}`)
            setPairingNotice(data)
            if (data.includes('Successfully')) {
                setStep(1)
                // Trigger a new discovery after successful pairing
                await discoverDevices()
            }
        } catch (error) {
            setPairingNotice(error as string)
        }
        setPairingLoading(false)
    }

    const connect = async () => {
        if (!ip2) return

        setConnectingLoading(true)
        try {
            await execute('adb disconnect') // Prevent "Multiple Device" Connections
            const data = await execute(`adb connect ${ip2}`)
            setConnectingNotice(data)
            if (data.includes('connected')) {
                setStep(2)
                setTimeout(() => {
                    navigate(-1)
                }, 2000)
            }
        } catch (error) {
            setConnectingNotice(error as string)
        }
        setConnectingLoading(false)
    }

    const renderDiscoveredDevices = () => {
        if (discoveredDevices.length === 0) return null;

        return (
            <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Discovered devices:
                </Typography>
                {discoveredDevices.map((device, index) => (
                    <Button
                        key={index}
                        variant="outlined"
                        size="small"
                        onClick={() => {
                            if (step === 0) {
                                setIp(device.ip)
                            } else {
                                setIp2(`${device.ip}:${device.port}`)
                            }
                        }}
                        sx={{ mr: 1, mb: 1 }}
                    >
                        {device.model ? `${device.model} (${device.ip}:${device.port})` : `${device.ip}:${device.port}`}
                    </Button>
                ))}
            </Box>
        )
    }

    return (
        <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ArrowBackIcon onClick={() => navigate(-1)} sx={{ cursor: 'pointer', mr: 1 }} />
                <Typography variant="h6">Wireless Connection Setup</Typography>
            </Box>

            <Typography color="text.secondary" sx={{ mb: 1 }}>
                Android 11+ is required for a wireless connection to be established.
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                <Button
                    onClick={() => window.open('https://developer.android.com/studio/command-line/adb')}
                >
                    More information on pairing
                </Button>
                <Button
                    onClick={discoverDevices}
                    disabled={isDiscovering}
                    startIcon={isDiscovering ? <CircularProgress size={20} /> : null}
                >
                    {isDiscovering ? 'Discovering...' : 'Discover Devices'}
                </Button>
            </Box>

            {renderDiscoveredDevices()}

            {step === 0 && (
                <Box>
                    <Typography variant="h5" sx={{ mb: 3 }}>Pairing</Typography>
                    <Typography variant="h6" align="center" sx={{ mb: 2 }}>
                        Wi-Fi pairing code
                    </Typography>

                    <OtpInput
                        value={pairCode}
                        onChange={setPairCode}
                        numInputs={6}
                        renderSeparator={<span>-</span>}
                        renderInput={(props) => (
                            <TextField
                                inputProps={props}
                                disabled={pairingLoading}
                            />
                        )}
                        shouldAutoFocus
                        containerStyle={{ justifyContent: 'center', gap: '10px' }}
                    />

                    <TextField
                        fullWidth
                        label="IP address & Port"
                        placeholder="ex. 192.168.1.10:42801"
                        value={ip}
                        onChange={(e) => setIp(e.target.value)}
                        disabled={pairingLoading}
                        onKeyDown={(e) => e.key === 'Enter' && pair()}
                        sx={{ mt: 2, mb: 2 }}
                    />

                    {pairingNotice && (
                        <Alert severity="error" sx={{ mb: 2 }}>{pairingNotice}</Alert>
                    )}

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Button
                            disabled={pairingLoading}
                            onClick={() => setStep(1)}
                        >
                            Skip
                        </Button>
                        <Button
                            variant="contained"
                            onClick={pair}
                            disabled={pairingLoading}
                            className="primaryButton"
                        >
                            Connect
                        </Button>
                    </Box>
                </Box>
            )}

            {step === 1 && (
                <Box>
                    <Typography variant="h5" sx={{ mb: 3 }}>Connecting</Typography>

                    <TextField
                        fullWidth
                        label="IP address & Port"
                        placeholder="ex. 192.168.1.10:42801"
                        value={ip2}
                        onChange={(e) => setIp2(e.target.value)}
                        disabled={connectingLoading}
                        onKeyDown={(e) => e.key === 'Enter' && connect()}
                        sx={{ mb: 2 }}
                    />

                    {connectingNotice && (
                        <Alert severity="error" sx={{ mb: 2 }}>{connectingNotice}</Alert>
                    )}

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Button
                            disabled={connectingLoading}
                            onClick={() => setStep(0)}
                        >
                            Back
                        </Button>
                        <Button
                            variant="contained"
                            onClick={connect}
                            disabled={connectingLoading}
                            className="primaryButton"
                        >
                            Connect
                        </Button>
                    </Box>
                </Box>
            )}

            {step === 2 && (
                <Box sx={{ textAlign: 'center' }}>
                    <PhoneCheckIcon sx={{ fontSize: '5em' }} />
                    <Typography variant="h5">Success!</Typography>
                    <LinearProgress sx={{ mt: 2 }} />
                </Box>
            )}
        </Box>
    )
}