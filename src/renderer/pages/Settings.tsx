import { useState, useEffect } from 'react'
import {
    Box,
    Typography,
    Switch,
    FormControlLabel,
    IconButton
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { useNavigate } from 'react-router-dom'

interface Setting {
    key: string
    description: string
    data: boolean
}

export const Settings = () => {
    const navigate = useNavigate()
    const [settings, setSettings] = useState<Setting[]>([
        {
            key: "setting.save_scrcpy_settings",
            description: "Remember SCRCPY settings",
            data: false
        }
    ])

    useEffect(() => {
        // Load saved settings
        const newSettings = settings.map(setting => ({
            ...setting,
            data: localStorage.getItem(setting.key) === 'true'
        }))
        setSettings(newSettings)
    }, [])

    const updateSetting = (key: string, value: boolean) => {
        localStorage.setItem(key, value.toString())
        setSettings(settings.map(setting =>
            setting.key === key ? { ...setting, data: value } : setting
        ))
    }

    return (
        <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <IconButton onClick={() => navigate(-1)} edge="start">
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h6" sx={{ ml: 1 }}>Settings</Typography>
            </Box>

            {settings.map((setting, index) => (
                <FormControlLabel
                    key={index}
                    control={
                        <Switch
                            checked={setting.data}
                            onChange={(e) => updateSetting(setting.key, e.target.checked)}
                        />
                    }
                    label={setting.description}
                />
            ))}
        </Box>
    )
}