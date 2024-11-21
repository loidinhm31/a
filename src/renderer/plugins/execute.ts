export const execute = async (cmd: string): Promise<string> => {
    if (!window.electron?.ipcRenderer?.invoke) {
        throw new Error('IPC renderer not initialized');
    }

    try {
        return await window.electron.ipcRenderer.invoke('execute-command', cmd);
    } catch (error) {
        console.error('Error executing command:', error);
        // Add more specific error handling
        if (error instanceof Error && error.message.includes('Command failed')) {
            throw new Error(`Failed to execute command "${cmd}". Please check if scrcpy resources are properly installed.`);
        }
        throw error;
    }
};

// Helper functions for common commands
export const checkAdbVersion = async (): Promise<string> => {
    return execute('adb --version');
};

export const getConnectedDevices = async (): Promise<string> => {
    return execute('adb devices');
};

export default {
    execute,
    checkAdbVersion,
    getConnectedDevices
};