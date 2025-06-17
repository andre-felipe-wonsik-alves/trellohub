// const { app, BrowserWindow } = require('electron');
import { app, BrowserWindow } from "electron";

app.whenReady().then(() => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
  });

  win.loadURL("http://localhost:5173");
});
