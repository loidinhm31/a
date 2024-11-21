import { execute } from './execute'

interface MirrorSettings {
    // Add settings interface based on your needs
    bitrate?: number
    maxSize?: number
}

export const mirror = {
    async start(settings: MirrorSettings, callback: () => void) {
        await execute(`adb exec-out screenrecord --output-format=h264 file.mp4`)
        callback()
    }
}