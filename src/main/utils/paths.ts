import { app } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

function getAppRootPath(): string {
    // Production environment
    if (app.isPackaged) {
        return path.join(process.resourcesPath, 'app.asar.unpacked');
    }

    // In development
    return path.join(path.dirname(fileURLToPath(import.meta.url)), '../..');
}

export function getResourcePath(): string {
    return path.join(getAppRootPath(), 'resources');
}

export function getScrcpyPath(): string {
    const platform = process.platform;
    const scrcpyExecutable = platform === 'win32' ? 'scrcpy.exe' : 'scrcpy';
    return path.join(getResourcePath(), 'scrcpy', scrcpyExecutable);
}

export function getAdbPath(): string {
    const platform = process.platform;
    const adbExecutable = platform === 'win32' ? 'adb.exe' : 'adb';
    return path.join(getResourcePath(), 'platform-tools', adbExecutable);
}