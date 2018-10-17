import { app, BrowserWindow, Menu } from 'electron';
import environment from './environment';

let mainWindow: Electron.BrowserWindow | undefined;

function createWindow() {
  if (environment.environment === 'production') {
    Menu.setApplicationMenu(null);
  }

  mainWindow = new BrowserWindow({ width: 800, height: 600, show: false });
  mainWindow.loadFile('renderer.html');

  if (environment.devTools) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = undefined;
  });

  mainWindow.on('ready-to-show', () => {
    if (mainWindow) {
      mainWindow.show();
    }
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === undefined) {
    createWindow();
  }
});
