const { app, BrowserWindow } = require('electron')
const path = require('path')

app.setAppUserModelId('Helsingin Herra')

app.whenReady().then(() => {
    const win = new BrowserWindow({
        width: 1280,
        height: 900,
        title: 'Helsingin Herra',
        icon: path.join(__dirname, 'icon.png'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        },
    })
    win.loadFile('index.html')
    win.removeMenu()
})

app.on('window-all-closed', () => app.quit())
