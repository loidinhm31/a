import { useState, useEffect } from 'react'
import {
    Box,
    Typography,
    Checkbox,
    FormControlLabel,
    Button,
    Slider,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { execute } from '../plugins/execute'

interface ScrcpyArg {
    arg: string
    description: string
}

export const Scrcpy = () => {
    const [loading, setLoading] = useState(false)
    const [running, setRunning] = useState(false)
    const [selectedArgs, setSelectedArgs] = useState<ScrcpyArg[]>([])
    const [bitrate, setBitrate] = useState(8)
    const [dialog, setDialog] = useState(false)
    const [dialogText, setDialogText] = useState('')

    const standardArgs: ScrcpyArg[] = [
        {
            arg: "--turn-screen-off",
            description: "Turn off the screen on the physical device"
        },
        {
            arg: "--stay-awake",
            description: "Prevent the device from sleeping"
        },
        {
            arg: "--no-control",
            description: "Disable mouse/keyboard passthrough"
        },
        {
            arg: "--disable-screensaver",
            description: "What it says"
        }
    ]

    const advancedArgs: ScrcpyArg[] = [
        {
            arg: "--otg",
            description: "Simulate physical hardware connections for input devices"
        },
        {
            arg: "--forward-all-clicks",
            description: "Pass all mouse actions to the device"
        },
        {
            arg: "--power-off-on-close",
            description: "Turn off the screen when exiting the application"
        },
        {
            arg: "--always-on-top",
            description: "Make scrcpy always the foreground window"
        },
        {
            arg: "--prefer-text",
            description: "By default, letters are injected using key events, so that the keyboard behaves as expected in games (typically for WASD keys). But this may cause issues."
        },
        {
            arg: "--raw-key-events",
            description: "The opposite of 'prefer text'"
        },
        {
            arg: "--no-key-repeat",
            description: "By default, holding a key down generates repeated key events. This can cause performance problems in some games, where these events are useless anyway."
        },
        {
            arg: "--show-touches",
            description: "Show physical touches and clicks"
        },
        {
            arg: "--lock-video-orientation",
            description: "Prevent the device screen from rotating."
        }
    ]

    useEffect(() => {
        if (localStorage.getItem("setting.save_scrcpy_settings") === 'true') {
            const savedArgs = JSON.parse(localStorage.getItem("data.scrcpy_settings") || '[]')
            const savedBitrate = parseInt(localStorage.getItem("data.scrcpy_bitrate") || '8')
            setSelectedArgs(savedArgs)
            setBitrate(savedBitrate)
        }
    }, [])

    const startScrcpy = async () => {
        setLoading(true)
        const flags = selectedArgs.map(arg => arg.arg).join(' ')

        if (localStorage.getItem("setting.save_scrcpy_settings") === 'true') {
            localStorage.setItem('data.scrcpy_settings', JSON.stringify(selectedArgs))
            localStorage.setItem('data.scrcpy_bitrate', bitrate.toString())
        }

        try {
            await execute(`scrcpy --video-bit-rate ${bitrate}M ${flags}`)
            setRunning(true)
        } catch (err: any) {
            if (!err.toString().startsWith('WARN:')) {
                console.error(err)
                setDialog(true)
                setDialogText(err.toString())
            }
            setRunning(false)
        }

        setTimeout(() => {
            setLoading(false)
            setRunning(true)
        }, 1000)
    }

    const handleArgChange = (arg: ScrcpyArg, checked: boolean) => {
        if (checked) {
            setSelectedArgs([...selectedArgs, arg])
        } else {
            setSelectedArgs(selectedArgs.filter(a => a.arg !== arg.arg))
        }
    }

    return (
        <Box sx={{ mt: 0 }}>
            {running ? (
                <Box>
                    <Typography variant="h6">SCRCPY Settings</Typography>
                    <Typography align="center">SCRCPY is currently running</Typography>
                </Box>
            ) : (
                <Box>
                    <Typography variant="h6">SCRCPY Settings</Typography>

                    {/* Standard Arguments */}
                    {standardArgs.map((arg, index) => (
                        <FormControlLabel
                            key={index}
                            control={
                                <Checkbox
                                    checked={selectedArgs.some(a => a.arg === arg.arg)}
                                    onChange={(e) => handleArgChange(arg, e.target.checked)}
                                />
                            }
                            label={arg.arg.replace(/-/g, ' ')}
                        />
                    ))}

                    {/* Advanced Settings */}
                    <Accordion sx={{ mt: 2, bgcolor: 'rgba(0,0,0,0.25)', borderRadius: 2 }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography>Advanced</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography>Video Bitrate {bitrate}M</Typography>
                            <Slider
                                value={bitrate}
                                onChange={(_, value) => setBitrate(value as number)}
                                min={1}
                                max={64}
                            />

                            {advancedArgs.map((arg, index) => (
                                <FormControlLabel
                                    key={index}
                                    control={
                                        <Checkbox
                                            checked={selectedArgs.some(a => a.arg === arg.arg)}
                                            onChange={(e) => handleArgChange(arg, e.target.checked)}
                                        />
                                    }
                                    label={arg.arg.replace(/-/g, ' ')}
                                />
                            ))}
                        </AccordionDetails>
                    </Accordion>

                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            variant="contained"
                            onClick={startScrcpy}
                            disabled={loading}
                            className="primaryButton"
                        >
                            Start SCRCPY
                        </Button>
                    </Box>
                </Box>
            )}

            {/* Error Dialog */}
            <Dialog open={dialog} onClose={() => setDialog(false)}>
                <DialogTitle sx={{ bgcolor: 'grey.900' }}>
                    An error has occurred
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    {dialogText}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialog(false)} className="primaryButton">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}