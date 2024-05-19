import { char } from "./src/char";
import myAnsi from "./src/my-ansi";
import type { Frame } from "./src/types/Frame";
import uniPrint from "./src/uni-print";
import {
  bg,
  bold,
  center,
  dim,
  fg,
  frame,
  hidden,
  inverse,
  italic,
  right,
  reset,
  underline,
} from "./src/utils";

const c = {
  c1: "#191D32",
  c2: "#282F44",
  c3: "#453A49",
  c4: "#6D3B47",
  c5: "#BA2C73",
  text: "#F8F8F2",
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const write = (text: string) => {
  process.stdout.write(text);
};

process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.setEncoding("utf8");

write(myAnsi.enableMouseTracking);

const log = (...text: any[]) => {
  console.log(...text);
};

process.on("exit", () => {
  write(myAnsi.disableMouseTracking);
});
process.stdin.on("data", (data: string) => {
  return;
  const first = data.at(0);
  const second = data.at(1);
  log(uniPrint(data));
  if (first == char.ESC && second == "[") {
    if (data?.endsWith("M")) {
      const [, x, y] = data.substring(0, data.length - 1).split(";");
      log("MOUSE", x, y);
    }
  }
});

const frameConfig: Frame = {
  vertical: "│",
  horizontal: "─",
  cornerTopLeft: "┌",
  cornerTopRight: "┐",
  cornerBottomLeft: "└",
  cornerBottomRight: "┘",
};

console.log(uniPrint(`${bg(c.c5)}${fg(c.text)}${bold()}Hello world${reset()}`));
console.log(
  `${frame(
    `${bg(c.c5)}${fg(c.text)}${bold()}Hello world${reset()}`,
    frameConfig
  )}`
);

console.log(`${frame(center("Hello world\nTest\n12345"), frameConfig)}`);
console.log(`${frame(right("Hello world\nTest\n12345"), frameConfig)}`);

// await wait(5000);

process.exit();
