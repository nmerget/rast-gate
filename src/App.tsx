import React, { Fragment, ReactElement, useEffect, useState } from "react";
import { ipcRenderer } from "electron";

// TODO: Make workspaces to get shared data
type TimesType = {
  id?: string;
  start?: Date;
  end?: Date;
  difference?: number;
  breaks?: TimesType[];
};

type ObjectKeysType = {
  [key: string]: string | number;
};
type TableRow = {
  key: string;
  label: string | any;
  cellFn?: (param: any) => string | ReactElement;
};
const tableRows: TableRow[] = [
  { key: "id", label: "Tag" },
  {
    key: "start",
    label: "Start",
    cellFn: (param) => new Date(param).toLocaleTimeString(),
  },
  {
    key: "end",
    label: "Ende",
    cellFn: (param) => new Date(param).toLocaleTimeString(),
  },
  {
    key: "breaks",
    label: "Pausen",
    cellFn: (param: TimesType[]) => (
      <>
        {param.map((pause) => (
          <Fragment key={`${pause.start}`}>
            <small>
              {`${new Date(
                pause.start || ""
              ).toLocaleTimeString()} - ${new Date(
                pause.end || ""
              ).toLocaleTimeString()}`}
            </small>
            <br />
          </Fragment>
        ))}
      </>
    ),
  },
];

const getRealTime = (time: number): string => {
  const realTime = time;
  if (realTime < 10) {
    return `0${realTime}`;
  }

  return realTime.toString();
};

const getHours = (time: TimesType): string => {
  let difference = Math.abs(
    time.difference
      ? time.difference
      : new Date().getTime() - new Date(time.start || "").getTime()
  );

  time.breaks?.forEach((pause: TimesType) => {
    if (pause.difference) {
      difference -= pause.difference;
    }
  });

  const sec = Math.floor(Math.abs(difference) / 1000);
  const min = Math.floor(sec / 60);
  const hours = Math.floor(min / 60);

  return `${getRealTime(hours)}:${getRealTime(min - hours * 60)}`;
};
const App = () => {
  const [file, setFile] = useState<
    (TimesType & ObjectKeysType)[] | undefined
  >();

  useEffect(() => {
    ipcRenderer?.on(
      "CHANNEL_TIMES",
      (_: any, value: (TimesType & ObjectKeysType)[]) => {
        setFile(value);
      }
    );
    return () => {
      ipcRenderer?.removeAllListeners("response");
    };
  }, []);
  return (
    <div className="App">
      {!file || (file.length === 0 && <span>Keine Zeiten vorhanden!</span>)}
      {file && file.length > 0 && (
        <table>
          <thead>
            <tr>
              {tableRows.map((row) => (
                <th key={row.key}>{row.label}</th>
              ))}
              <th>Arbeitszeit</th>
            </tr>
          </thead>
          <tbody>
            {file?.map((day) => (
              <tr key={day.id}>
                {tableRows.map((row) => (
                  <td key={`${row.key}-${day.id}`}>
                    {row.cellFn ? row.cellFn(day[row.key]) : day[row.key]}
                  </td>
                ))}
                <td>{getHours(day)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default App;
