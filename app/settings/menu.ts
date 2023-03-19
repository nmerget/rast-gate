import { Menu } from "electron";
import MenuItemConstructorOptions = Electron.MenuItemConstructorOptions;

const generateMenu = () => {
  const isMac = process.platform === "darwin";
  const template: Array<MenuItemConstructorOptions> = [
    {
      label: "File",
      submenu: [
        isMac ? { role: "close" } : { role: "quit" },
        { label: "Test" },
      ],
    },
  ];
  const menu = Menu.buildFromTemplate(template);
  // TODO: enable this again  Menu.setApplicationMenu(menu);
};

export default generateMenu;
