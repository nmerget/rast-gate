import { app, BrowserWindow } from "electron";
import { release } from "node:os";
import { join } from "node:path";
import createTray from "../settings/tray";
import createWindow from "../settings/create-window";
import handlePowerMonitor from "../settings/power-monitor";
import generateMenu from "../settings/menu";
import { saveEndTime, saveStartTime } from "../utils";

process.env.DIST_ELECTRON = join(__dirname, "../");
process.env.DIST = join(process.env.DIST_ELECTRON, "../dist");
process.env.PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? join(process.env.DIST_ELECTRON, "../public")
  : process.env.DIST;

// Disable GPU Acceleration for Windows 7
if (release().startsWith("6.1")) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === "win32") app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

// Remove electron security warnings
// This warning only shows in development mode
// Read more on https://www.electronjs.org/docs/latest/tutorial/security
// process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

let win: BrowserWindow | null = null;

let tray = null;

app.whenReady().then(() => {
  if (!tray) {
    createTray(win, createWindow);
  }
  win = createWindow();

  saveStartTime(win);
  handlePowerMonitor(win);
  generateMenu();
});

app.on("window-all-closed", () => {
  if (process.platform === "darwin") {
    app.dock.hide();
  }
});

app.on("second-instance", () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

app.on("activate", () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    win = createWindow();
  }
});

let asyncOperationDone = false;

app.on("before-quit", async (e) => {
  if (!asyncOperationDone) {
    e.preventDefault();
    await saveEndTime(win);
    asyncOperationDone = true;
    app.quit();
  }
});
