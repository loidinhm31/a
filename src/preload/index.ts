import { contextBridge, ipcRenderer } from 'electron'

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
    'electron',
    {
        ipcRenderer: {
            invoke: (channel: string, ...args: any[]) => {
                const validChannels = ['execute-command'];
                if (validChannels.includes(channel)) {
                    return ipcRenderer.invoke(channel, ...args);
                }
                throw new Error(`Invalid channel: ${channel}`);
            }
        }
    }
)

interface IElectronAPI {
    ipcRenderer: {
        send(channel: string, ...args: any[]): void;
        on(channel: string, func: (...args: any[]) => void): void;
        invoke(channel: string, ...args: any[]): Promise<any>;
    };
    openExternal: (url: string) => Promise<void>
}

declare global {
    interface Window {
        electron: IElectronAPI;
    }
}