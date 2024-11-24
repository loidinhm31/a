import { execute } from "./execute";

async function shell(cmd: string): Promise<string> {
    return execute(`adb shell "${cmd}"`)
}

interface FileManagerResult {
    files: string[]
    directories: string[]
}

export const fileManager = {
    async getDir(dir = "/"): Promise<FileManagerResult> {
        let files: string[] = []
        let directories: string[] = []

        try {
            // Use ls -1 to list one file per line, and handle patterns separately
            // -A shows all entries except . and ..
            const result = await window.electron.ipcRenderer.invoke(
                'shell-command',
                `cd "${dir}" && ls -1A`
            )

            if (result) {
                const entries = result.replace(/\r/g, "").split('\n').filter(Boolean)

                // Separate directories and files using a second command
                const dirCheck = await Promise.all(
                    entries.map((entry: any) =>
                        window.electron.ipcRenderer.invoke(
                            'shell-command',
                            `test -d "${dir}/${entry}" && echo "true" || echo "false"`
                        )
                    )
                )

                entries.forEach((entry: string, index: number) => {
                    if (dirCheck[index]?.trim() === 'true') {
                        directories.push(entry)
                    } else {
                        files.push(entry)
                    }
                })
            }

            return { files, directories }
        } catch (err) {
            console.error('Error listing directory:', err)
            return { files, directories }
        }
    },

    async download(file: string): Promise<string | undefined> {
        if (!file) return
        try {
            return await window.electron.ipcRenderer.invoke('download-file', file)
        } catch (err) {
            console.error('Error downloading file:', err)
            return undefined
        }
    },

    async delete(file: string): Promise<string | undefined> {
        if (!file) return
        try {
            return await window.electron.ipcRenderer.invoke('delete-file', file)
        } catch (err) {
            console.error('Error deleting file:', err)
            return undefined
        }
    },
}