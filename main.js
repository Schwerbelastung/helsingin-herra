const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron')
const path = require('path')

app.setAppUserModelId('Helsingin Herra')

app.whenReady().then(() => {
    const win = new BrowserWindow({
        width: 1280,
        height: 900,
        fullscreen: true,
        title: 'Helsingin Herra',
        icon: path.join(__dirname, 'icon.png'),
        minWidth: 960,
        minHeight: 540,
        minAspectRatio: 16 / 9,
        maxAspectRatio: 16 / 9,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        },
    })
    win.loadFile('index.html')
    win.removeMenu()

    // IPC: toggle fullscreen from renderer
    ipcMain.on('set-fullscreen', (event, flag) => {
        win.setFullScreen(flag)
        if (!flag) win.maximize()
    })
    ipcMain.on('is-fullscreen', (event) => {
        event.returnValue = win.isFullScreen()
    })

    // F11 toggles fullscreen
    globalShortcut.register('F11', () => {
        const fs = win.isFullScreen()
        win.setFullScreen(!fs)
        if (fs) win.maximize()
    })
})

app.on('will-quit', () => globalShortcut.unregisterAll())
app.on('window-all-closed', () => app.quit())
