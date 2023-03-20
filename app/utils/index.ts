import { getSync, set } from "electron-json-storage";
import { BrowserWindow } from "electron";
import type { TimesType } from "../shared/data/times";
import { CHANNEL_TIMES } from "../shared/constants";

const TIMES_FILE = "rast-gate-times";

const now = new Date();
const currentDay = `${now.getDate()}.${
  now.getMonth() + 1
}.${now.getFullYear()}`;

const getCurrentDay = (): TimesType =>
  getSync(TIMES_FILE)[currentDay] ?? {
    id: currentDay,
  };

const updateCurrentDay = async (win: BrowserWindow, updateTimes: TimesType) => {
  try {
    const timesFile = getSync(TIMES_FILE);
    timesFile[currentDay] = {
      ...timesFile[currentDay],
      ...updateTimes,
    };
    await new Promise((resolve) => {
      set(TIMES_FILE, timesFile, () => {
        if (win !== null && !win.isDestroyed()) {
          win.webContents.send(CHANNEL_TIMES, getAllTimes());
        }
        resolve(true);
      });
    });
  } catch (e) {
    console.error("updateCurrentDay", e);
  }
};

export const getAllTimes = (): TimesType[] => {
  const times = getSync(TIMES_FILE);
  return times
    ? Object.keys(times).map((timeKey) => times[timeKey] as TimesType)
    : [];
};

export const saveStartTime = async (win: BrowserWindow) => {
  const currentDayTimes = getCurrentDay();
  if (!currentDayTimes.start) {
    await updateCurrentDay(win, { ...currentDayTimes, start: now });
  }
};

export const saveEndTime = async (win: BrowserWindow) => {
  try {
    const currentDayTimes = getCurrentDay();
    const end = new Date();
    const difference =
      end?.getTime() - new Date(currentDayTimes?.start).getTime() ?? 0;
    await updateCurrentDay(win, { end, difference });
  } catch (e) {
    console.error("saveEndTime", e);
  }
};

export const updateBreaks = async (
  win: BrowserWindow,
  currentPause: TimesType
) => {
  currentPause.end = new Date();
  currentPause.difference =
    currentPause.end.getTime() - currentPause.start.getTime();
  const currentDayTimes: TimesType = getCurrentDay();
  if (!currentDayTimes.breaks) {
    currentDayTimes.breaks = [];
  }
  currentDayTimes.breaks.push(currentPause);
  await updateCurrentDay(win, currentDayTimes);
};

export default { saveEndTime, saveStartTime, updateBreaks, getAllTimes };
