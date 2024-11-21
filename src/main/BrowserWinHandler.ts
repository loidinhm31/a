import { BrowserWindow, app } from 'electron'
import { EventEmitter } from 'events'
import path from 'node:path'

export default class BrowserWinHandler {
  private _eventEmitter: EventEmitter
  private allowRecreate: boolean
  private options: Electron.BrowserWindowConstructorOptions
  public browserWindow: BrowserWindow | null

  constructor(options: Electron.BrowserWindowConstructorOptions, allowRecreate = true) {
    this._eventEmitter = new EventEmitter()
    this.allowRecreate = allowRecreate
    this.options = options
    this.browserWindow = null
    this._createInstance()
  }

  private _createInstance(): void {
    if (app.isReady()) {
      this._create()
    } else {
      app.once('ready', () => {
        this._create()
      })
    }

    if (!this.allowRecreate) return
    app.on('activate', () => this._recreate())
  }

  private _create(): void {
    this.browserWindow = new BrowserWindow({
      ...this.options,
      webPreferences: {
        ...this.options.webPreferences,
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, '../preload/index.js')
      }
    })

    this.browserWindow.on('closed', () => {
      this.browserWindow = null
    })

    // Load the appropriate URL
    if (process.env.NODE_ENV === 'development') {
      const port = process.env.PORT || 5173
      this.browserWindow.loadURL(`http://localhost:${port}`)
      this.browserWindow.webContents.openDevTools()
    } else {
      this.browserWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
    }

    this._eventEmitter.emit('created')
  }

  private _recreate(): void {
    if (this.browserWindow === null) this._create()
  }

  onCreated(callback: (browserWindow: BrowserWindow) => void): void {
    if (this.browserWindow) {
      callback(this.browserWindow)
      return
    }
    this._eventEmitter.once('created', () => {
      if (this.browserWindow) {
        callback(this.browserWindow)
      }
    })
  }

  async loadPage(pagePath: string): Promise<void> {
    if (!this.browserWindow) {
      throw new Error('The page could not be loaded before win \'created\' event')
    }
    if (process.env.NODE_ENV === 'development') {
      const port = process.env.PORT || 5173
      await this.browserWindow.loadURL(`http://localhost:${port}#${pagePath}`)
    } else {
      await this.browserWindow.loadFile(
          path.join(__dirname, '../renderer/index.html'),
          { hash: pagePath }
      )
    }
  }
}