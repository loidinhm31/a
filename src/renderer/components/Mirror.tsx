import { useState, useEffect } from 'react'
import {
    Box,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material'
import { execute } from '../plugins/execute'

export const Mirror = () => {
    const [running, setRunning] = useState(false)
    const [loading, setLoading] = useState(false)
    const [dialog, setDialog] = useState(false)
    const [dialogText, setDialogText] = useState('')

    const startMirror = async () => {
        setLoading(true)
        try {
            await execute('scrcpy --no-control --stay-awake --turn-screen-off')
            setRunning(true)
        } catch (error: any) {
            if (!error.toString().startsWith('WARN:')) {
                setDialogText(error as string)
                setDialog(true)
            }
        }
        setLoading(false)
    }

    if (running) {
        return (
            <Box sx={{ mt: 2 }}>
                <Typography variant="h6">Mirror Settings</Typography>
                <Typography align="center">Mirror is currently running</Typography>
            </Box>
        )
    }

    return (
        <Box sx={{ mt: 2 }}>
            <Typography variant="h6">Mirror Settings</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                    variant="contained"
                    onClick={startMirror}
                    disabled={loading}
                    className="primaryButton"
                >
                    Start Mirror
                </Button>
            </Box>

            <Dialog open={dialog} onClose={() => setDialog(false)}>
                <DialogTitle>An error has occurred</DialogTitle>
                <DialogContent>
                    <Typography>{dialogText}</Typography>
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