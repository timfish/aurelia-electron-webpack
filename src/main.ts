import { app, BrowserWindow, Menu } from 'electron';
import environment from './environment';

let mainWindow: Electron.BrowserWindow | undefined;

function createWindow() {
  if (!environment.debug) {
    Menu.setApplicationMenu(null);
  }

  mainWindow = new BrowserWindow({ width: 800, height: 600 });
  mainWindow.loadFile('index.html');

  // mainWindow.webContents.openDevTools()

  mainWindow.on('closed', () => {
    mainWindow = undefined;
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
