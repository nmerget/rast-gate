import { BrowserWindow, powerMonitor } from "electron";
import { updateBreaks } from "../utils";
import { TimesType } from "../shared/data/times";

const handlePowerMonitor = (win: BrowserWindow) => {
  let currentPause: TimesType | null = null;

  powerMonitor.addListener("lock-screen", () => {
    currentPause = { start: new Date() };
  });

  powerMonitor.addListener("unlock-screen", async () => {
    if (currentPause) {
      await updateBreaks(win, currentPause);
      currentPause = null;
    }
  });
};

export default handlePowerMonitor;
