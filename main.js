const { app, BrowserWindow } = require('electron')
const path = require('path')

app.setAppUserModelId('Helsingin Herra')

app.whenReady().then(() => {
    const win = new BrowserWindow({
        width: 1280,
        height: 900,
        title: 'Helsingin Herra',
        icon: path.join(__dirname, 'icon.png'),
        // Lock to 16:9 aspect ratio (prevents ultrawide stretching)
        minWidth: 960,
        minHeight: 540,
        minAspectRatio: 16 / 9,
        maxAspectRatio: 16 / 9,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        },
    })
    win.loadFile('index.html')
    win.removeMenu()
})

app.on('window-all-closed', () => app.quit())
