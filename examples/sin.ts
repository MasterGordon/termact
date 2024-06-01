import Terminal from "../src/Terminal";
import { fg } from "../src/utils";

const terminal = new Terminal({
  alternateBuffer: true,
  mouseTracking: true,
  cursorHidden: true,
});

let [terminalWidth, terminalHeight] = process.stdout.getWindowSize();
terminal.events.on("resize", (width, height) => {
  terminalWidth = width;
  terminalHeight = height;
});

let x = 0;
const lineHeight = 2;

let r = 0;
let deltaR = 0.01;
let g = 0;
let deltaG = 0.02;
let b = 0;
let deltaB = 0.015;
const drawSineWave = () => {
  const dx = (Math.PI * 2) / terminalWidth;
  const columns: string[] = [];
  for (let i = 0; i < terminalWidth; i++) {
    r += deltaR;
    if (r >= 255) {
      deltaR = -0.01;
    } else if (r <= 0) {
      deltaR = 0.01;
    }
    g += deltaG;
    if (g >= 255) {
      deltaG = -0.02;
    } else if (g <= 0) {
      deltaG = 0.02;
    }
    b += deltaB;
    if (b >= 255) {
      deltaB = -0.015;
    } else if (b <= 0) {
      deltaB = 0.015;
    }
    const value = Math.sin(dx * (i + x)) * terminalHeight * 0.4;
    for (let j = 0; j < terminalHeight; j++) {
      columns[j] ||= "";
      const at = j - terminalHeight * 0.5;
      if (at > value - 0.5 * lineHeight && at < value + 0.5 * lineHeight) {
        const color = [Math.floor(r), Math.floor(g), Math.floor(b)] as [
          number,
          number,
          number
        ];
        columns[j] += fg(color) + "█";
      } else {
        columns[j] += " ";
      }
    }
  }
  r += deltaR;
  terminal.printAt(0, 0, columns.join("\n"));
  x += 0.3;
};

setInterval(drawSineWave, 3);
