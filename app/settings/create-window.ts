import { BrowserWindow, shell } from "electron";
import { join } from "node:path";
import { getAllTimes } from "../utils";
import { CHANNEL_TIMES } from "../shared/constants";
const createWindow = (): BrowserWindow => {
  const win = new BrowserWindow({
    title: "Rastgate",
    icon: join(process.env.PUBLIC, "favicon.ico"),
    webPreferences: {
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      nodeIntegration: true,
      contextIsolation: false, // protect against prototype pollution
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    // electron-vite-vue#298
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
    // Open devTool if the app is not packaged
    win.webContents.openDevTools();
  } else {
    win.loadFile(join(process.env.DIST, "index.html"));
  }

  // Test actively push message to the Electron-Renderer
  win.webContents.on("did-finish-load", () => {
    win.webContents.send(CHANNEL_TIMES, getAllTimes());
  });

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:")) shell.openExternal(url);
    return { action: "deny" };
  });

  if (process.platform === "win32") {
    win.setSkipTaskbar(true);
  }

  return win;
};

export default createWindow;
