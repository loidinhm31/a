import { useState, useEffect } from 'react'
import { Box, Alert, Button, Typography } from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings'
import { useNavigate } from 'react-router-dom'
import discordIcon from '../assets/discord-icon.svg'
import { execute } from '../plugins/execute'
import { APP_VERSION } from "@/env.ts"

export const ScrcpyPlusInfo = () => {
    const navigate = useNavigate()
    const [version] = useState(APP_VERSION)
    const [scrcpyVersion, setScrcpyVersion] = useState(localStorage.getItem("scrcpyVersion"))
    const [adbVersion, setAdbVersion] = useState(localStorage.getItem("adbVersion"))
    const [startupError, setStartupError] = useState(false)
    const [error, setError] = useState('')
    const [reason, setReason] = useState('SCRCPY or ADB')

    const errHandler = (error: unknown) => {
        setStartupError(true)
        const errorMessage = error instanceof Error ? error.message : String(error)
        setError(errorMessage)

        // Convert error message to lowercase for case-insensitive comparison
        const lowerError = errorMessage.toLowerCase()
        if (lowerError.includes("scrcpy")) {
            setReason("SCRCPY")
        } else if (lowerError.includes("adb")) {
            setReason("ADB")
        } else if (lowerError.includes("path")) {
            setReason("PATH configuration")
        }
    }

    useEffect(() => {
        const checkVersions = async () => {
            // Check ADB version
            try {
                const adbData = await execute("adb --version")
                const adbVersionMatch = adbData.match(/version\s+([\d.]+)/i)
                if (adbVersionMatch?.[1]) {
                    const adbVer = adbVersionMatch[1].trim()
                    setAdbVersion(adbVer)
                    localStorage.setItem("adbVersion", adbVer)
                } else {
                    throw new Error("Unable to parse ADB version")
                }
            } catch (err) {
                errHandler(err)
                return // Stop checking if ADB fails
            }

            // Check Scrcpy version
            try {
                const scrcpyData = await execute("scrcpy --version")
                const scrcpyVersionMatch = scrcpyData.match(/\d+\.\d+(?:\.\d+)?/)
                if (scrcpyVersionMatch?.[0]) {
                    const scrcpyVer = scrcpyVersionMatch[0].trim()
                    setScrcpyVersion(scrcpyVer)
                    localStorage.setItem("scrcpyVersion", scrcpyVer)
                } else {
                    throw new Error("Unable to parse scrcpy version")
                }
            } catch (err) {
                errHandler(err)
            }
        }

        checkVersions()
    }, [])

    return (
        <Box sx={{ m: 2 }}>
            {startupError && (
                <Alert
                    severity="error"
                    sx={{ mb: 2, borderRadius: '1em' }}
                >
                    <Typography variant="h6">Error Starting SCRCPY+</Typography>
                    <Typography color="text.secondary">
                        This error could be caused by <strong>{reason}</strong> not being properly installed or configured on your system.
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                        <Typography><strong>More Details</strong></Typography>
                        <Typography sx={{ whiteSpace: 'pre-wrap' }}>{error}</Typography>
                    </Box>
                </Alert>
            )}

            <Typography variant="h4">
                SCRCPY+ <Typography component="span" color="text.secondary">{version}</Typography>
            </Typography>
            <Typography variant="h6">
                SCRCPY <Typography component="span" color="text.secondary">{scrcpyVersion || 'Not detected'}</Typography>
            </Typography>
            <Typography variant="h6">
                ADB <Typography component="span" color="text.secondary">{adbVersion || 'Not detected'}</Typography>
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Button
                    variant="contained"
                    onClick={() => window.open('https://discord.gg/APQyKz9e9w')}
                    className="primaryButton"
                    startIcon={<img src={discordIcon} alt="" style={{ width: '1.8em' }} />}
                >
                    Discord
                </Button>
                <Button
                    variant="contained"
                    onClick={() => navigate('/settings')}
                    className="primaryButton"
                    startIcon={<SettingsIcon />}
                >
                    Settings
                </Button>
            </Box>
        </Box>
    )
}