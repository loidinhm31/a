import { Box, Button, Chip, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import Icon from '@mui/material/Icon'

interface Tool {
    title: string
    icon: string
    to: string
    beta?: boolean
    disabled?: boolean
}

export const Tools = () => {
    const navigate = useNavigate()

    const tools: Tool[] = [
        {
            title: "Package Manager",
            icon: "mdi-package-variant",
            to: "/tools/apps",
            beta: true
        },
        {
            title: "File Manager",
            icon: "mdi-folder-open",
            to: "/tools/files"
        }
    ]

    return (
        <Box sx={{
            border: '2px solid #38373A',
            borderRadius: '1.5em',
            m: 2,
            p: 2
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h6">Tools</Typography>
                <Chip
                    label="Beta"
                    color="primary"
                    size="small"
                    sx={{ height: '2em' }}
                />
            </Box>

            <Typography color="text.secondary">
                All tools are written by me for SCRCPY+. All bug reports should go through the GitHub!
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                {tools.map((tool, index) => (
                    <Button
                        key={index}
                        variant="outlined"
                        startIcon={<Icon>{tool.icon}</Icon>}
                        onClick={() => navigate(tool.to)}
                        disabled={tool.disabled}
                        className="primaryButton"
                    >
                        {tool.title}
                    </Button>
                ))}
            </Box>
        </Box>
    )
}