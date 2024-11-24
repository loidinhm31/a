import { ipcMain } from "electron";
import { exec } from "child_process";
import { getAdbPath, getScrcpyPath } from "../utils/paths";
import path from "path";
import fs from "fs";

export function setupCommandExecutionHandler(): void {
    ipcMain.handle('execute-command', async (_, cmd: string) => {
        try {
            const scrcpyPath = getScrcpyPath();
            const adbPath = getAdbPath();

            // Verify paths exist
            if (!fs.existsSync(scrcpyPath)) {
                throw new Error(`Scrcpy path not found: ${scrcpyPath}`);
            }
            if (!fs.existsSync(adbPath)) {
                throw new Error(`ADB executable not found: ${adbPath}`);
            }

            // Replace 'adb' with the full path to adb executable
            const modifiedCmd = cmd.replace(/^adb\s/, `"${adbPath}" `);

            console.log('Executing command:', modifiedCmd);
            console.log('Working directory:', scrcpyPath);

            return new Promise((resolve, reject) => {
                const options = {
                    cwd: path.dirname(scrcpyPath),
                    env: {
                        ...process.env,
                        PATH: `${path.dirname(adbPath)}${path.delimiter}${process.env.PATH}`
                    },
                };

                exec(modifiedCmd, options, (error, stdout, stderr) => {
                    if (error) {
                        console.error('Command execution error:', error);
                        reject(error);
                        return;
                    }

                    if (stderr) {
                        console.warn('Command stderr:', stderr);
                    }

                    console.log('Command stdout:', stdout);
                    resolve(stdout);
                });
            });
        } catch (error) {
            console.error('Error in execute-command handler:', error);
            throw error;
        }
    });
}