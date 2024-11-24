import { Box, Button, Chip, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Apps as AppsIcon, Folder as FolderIcon } from "@mui/icons-material";


interface Tool {
    title: string
    icon: keyof typeof iconMapping
    to: string
    beta?: boolean
    disabled?: boolean
}

const iconMapping = {
    'package': AppsIcon,
    'folder': FolderIcon,
} as const

export const Tools = () => {
    const navigate = useNavigate()

    const tools: Tool[] = [
        {
            title: "Package Manager",
            icon: "package",  // Using the key from iconMapping
            to: "/tools/apps",
            beta: true
        },
        {
            title: "File Manager",
            icon: "folder",   // Using the key from iconMapping
            to: "/tools/files"
        }
    ]

    // Helper function to get icon component
    const getIcon = (iconName: keyof typeof iconMapping) => {
        const IconComponent = iconMapping[iconName]
        return <IconComponent />
    }

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
                        startIcon={getIcon(tool.icon)}
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