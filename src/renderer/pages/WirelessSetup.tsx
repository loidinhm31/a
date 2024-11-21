import { useState } from 'react'
import {
    Box,
    Typography,
    TextField,
    Button,
    Alert,
    Icon,
    LinearProgress
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import PhoneCheckIcon from '@mui/icons-material/PhoneAndroid'
import { useNavigate } from 'react-router-dom'
import { execute } from '../plugins/execute'
import OtpInput from 'react-otp-input'

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

    const pair = async () => {
        if (!ip || !pairCode) return

        setPairingLoading(true)
        try {
            const data = await execute(`adb pair ${ip} ${pairCode}`)
            setPairingNotice(data)
            if (data.includes('Successfully')) {
                setStep(1)
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

    return (
        <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ArrowBackIcon onClick={() => navigate(-1)} sx={{ cursor: 'pointer', mr: 1 }} />
                <Typography variant="h6">Wireless Connection Setup</Typography>
            </Box>

            <Typography color="text.secondary" sx={{ mb: 1 }}>
                Android 11+ is required for a wireless connection to be established.
            </Typography>

            <Button
                onClick={() => window.open('https://developer.android.com/studio/command-line/adb')}
                sx={{ mb: 3 }}
            >
                More information on pairing
            </Button>

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