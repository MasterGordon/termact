import fs from "fs";

const logFile = "log.txt";

const clearLogFile = () => {
  fs.writeFileSync(logFile, "");
};

export const logToFile = (text: string) => {
  fs.appendFileSync(logFile, text + "\n");
};

clearLogFile();
