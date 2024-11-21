import { shell } from 'electron'

interface WindowFeatures {
    autoHideMenuBar: boolean
}

export const utils = {
    openInternal(url: string) {
        const features: WindowFeatures = {
            autoHideMenuBar: true
        }
        window.open(url, '_blank', Object.entries(features)
            .map(([key, value]) => `${key}=${value}`)
            .join(','))
    },

    openExternal(url: string) {
        shell.openExternal(url)
    }
}