import {app} from 'electron'
import {createWindow} from './mainWindow'
import {setupCommandExecutionHandler} from './handlers/commands'

// Suppress Autofill warnings
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'


app.whenReady().then(() => {
    createWindow()

    // Setup IPC handlers
    setupCommandExecutionHandler()
})

// Quit when all windows are closed
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})