const { app, BrowserWindow, Tray, Menu } = require('electron');
const path = require('path');
const url = require('url');
const config = require('./config');

const isDevelopment = process.env.NODE_ENV === 'development';
let tray = null;
const mainInfo = {};
async function createWindow () {
  tray = new Tray(config.icon);
  const win = mainInfo.win =  new BrowserWindow({
    width: 1020,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      backgroundThrottling: false,
      contextIsolation: false,
    },
    frame: false,
    show: true,
    resizable: false,
    icon: config.icon,
    useContentSize: true,
    backgroundColor: '#121212'
  });
  const contextMenu = Menu.buildFromTemplate([
    { label: config.title, type: 'normal', click: () => win.show() },
    { label: '退出', type: 'normal', click: () => app.quit() }
  ]);
  tray.setToolTip(config.title);
  tray.setContextMenu(contextMenu);
  tray.on('click', () => win.show());
  if (isDevelopment) {
    try {
      await win.loadURL('http://127.0.0.1:3333');
    } catch (e) { console.error(e); }
  } else {
    try {
      await win.loadURL(url.format({
        pathname: path.join(__dirname, '../build/index.html'),
        protocol: 'file:',
        slashes: true
      }));
    } catch (e) { console.error(e); }
  }
  win.webContents.addListener('before-input-event', (e, input) => {
    if (input.type === 'keyDown' && input.code === 'F5') {
      win.reload();
    }
    if (input.type === 'keyDown' && input.code === 'F12') {
      win.webContents.openDevTools();
    }
  });
}

app.whenReady().then(createWindow);

exports.mainInfo = mainInfo;
