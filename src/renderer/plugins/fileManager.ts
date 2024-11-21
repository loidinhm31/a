import { homedir } from 'os'
import { execute } from './execute'

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
            const filesResult = await shell(`cd ${dir} && ls -d *.*`)
            const directoriesResult = await shell(`cd ${dir} && ls -d */`)

            if (filesResult) {
                files = filesResult.replace(/\r/g, "").split('\n').filter(Boolean)
            }

            if (directoriesResult) {
                directories = directoriesResult.replace(/\r/g, "").split('\n').filter(Boolean)
            }

            return { files, directories }
        } catch (err) {
            console.log(err)
            return { files, directories }
        }
    },

    async download(file: string): Promise<string | undefined> {
        if (!file) return
        const desktop = `${homedir()}/Desktop`
        return execute(`adb pull ${file} ${desktop}`)
    },

    async delete(file: string): Promise<string | undefined> {
        if (!file) return
        return execute(`adb shell "rm ${file}"`)
    }
}