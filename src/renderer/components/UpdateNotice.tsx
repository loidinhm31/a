import { useEffect, useState } from "react";
import { Alert, Box, Button, Typography } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import axios from "axios";
import { APP_VERSION, RELEASES_URL } from "@/env.ts";

interface Release {
    name: string
    html_url: string
}

export const UpdateNotice = () => {
    const [updateAvailable, setUpdateAvailable] = useState(false)
    const [currentVersion] = useState(APP_VERSION)
    const [latestVersion, setLatestVersion] = useState('')
    const [repo, setRepo] = useState<Release[]>([])

    useEffect(() => {
        const checkForUpdates = async () => {
            try {
                const { data } = await axios.get<Release[]>(RELEASES_URL)
                setRepo(data)

                const current = currentVersion.split(".")

                if (data.length > 0) {
                    setLatestVersion(data[0].name)

                    const latest = data[0].name.split(".")

                    // Fix the type error by ensuring i is used as a number
                    for (let i = 0; i < latest.length; i++) {
                        if (parseInt(latest[i]) > parseInt(current[i])) {
                            setUpdateAvailable(true)
                            break
                        }
                    }
                }
            } catch (err) {
                console.error('Failed to check for updates:', err)
            }
        }

        checkForUpdates()
    }, [currentVersion])

    const handleDownload = () => {
        if (repo.length > 0) {
            window.electron.openExternal(repo[0].html_url)
        }
    }

    if (!updateAvailable) return null

    return (
        <Alert
            severity="info"
            sx={{
                m: 2,
                borderRadius: '1.5em',
                '& .MuiAlert-message': { width: '100%' }
            }}
        >
            <Typography variant="h6">Update Available</Typography>
            <Typography color="text.secondary">
                A new version of SCRCPY+ is ready to be downloaded
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography>{currentVersion}</Typography>
                <ArrowRightIcon color="primary" sx={{ transform: 'translateY(-10%)' }} />
                <Typography>{latestVersion}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownload}
                    className="primaryButton"
                >
                    Download
                </Button>
            </Box>
        </Alert>
    )
}