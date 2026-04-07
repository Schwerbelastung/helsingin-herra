const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    setFullscreen: (flag) => ipcRenderer.send('set-fullscreen', flag),
    isFullscreen: () => ipcRenderer.sendSync('is-fullscreen'),
})
