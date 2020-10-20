const { app, BrowserWindow, Tray, Menu } = require('electron');
const path = require('path');
const url = require('url');

const isProduction = process.env.NODE_ENV === 'production';
let tray = null;

async function createWindow () {
  tray = new Tray(path.resolve(__dirname, './logo.png'));
  const win = new BrowserWindow({
    width: 360,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      backgroundThrottling: false
    },
    frame: false,
    show: true,
    resizable: false,
    icon: path.resolve(__dirname, './logo.png')
  });
  const contextMenu = Menu.buildFromTemplate([
    { label: 'QQ 音乐', type: 'normal', click: () => win.show() },
    { label: '退出', type: 'normal', click: () => app.quit() }
  ]);
  tray.setToolTip('QQ 音乐');
  tray.setContextMenu(contextMenu);
  tray.on('click', () => win.show());
  if (isProduction) {
    await win.loadURL(url.format({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file:',
      slashes: true
    }));
  } else {
    try {
      await win.loadURL('http://127.0.0.1:3333');
    } catch (e) {
      console.error(e);
    }
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
