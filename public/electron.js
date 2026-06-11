const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');

function createMainWindow() {
  const mainWindow = new BrowserWindow({
    title: 'Work Faster',
    width: 400,
    height: 400,
    minWidth: 400,
    minHeight: 400,
    maxWidth: 600,
    maxHeight: 600,
    frame: false,
    titleBarStyle: 'hidden',
    webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: false,
        contextIsolation: true,
    }
  });

  // Hide top menus and dot icons
    mainWindow.setMenuBarVisibility(false);

    const startUrl = url.format({
        pathname: path.join(__dirname, '../build/index.html'),
        protocol: 'file:',
        slashes: true
    });

    mainWindow.loadURL(startUrl);
}

    app.whenReady().then(createMainWindow);

    // Listen for custom close button click from React Frontend
    ipcMain.on('close-app', () => {
        app.quit();
});