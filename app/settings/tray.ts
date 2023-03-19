import { app, nativeImage, Tray, Menu, BrowserWindow } from "electron";
import { join } from "node:path";

const createTray = (
  win: BrowserWindow | null,
  createWindow: () => BrowserWindow
) => {
  const icon = join(process.env.PUBLIC, "favicon.ico"); // required.
  const trayicon = nativeImage.createFromPath(icon);
  const tray = new Tray(trayicon.resize({ width: 16 }));

  const showAppClick = () => {
    if (win!==null && !win?.isDestroyed()) {
      win.focus();
    } else {
      win = createWindow();
    }
  };

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Show App",
      click: showAppClick,
    },
    {
      label: "Quit",
      click: () => {
        app.quit(); // actually quit the app.
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
  tray.on("double-click", showAppClick);
  return tray;
};

export default createTray;
