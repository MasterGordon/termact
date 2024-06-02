import { Glob } from "bun";
import Terminal from "../src/Terminal";
import { PNG } from "pngjs";
import fs from "fs";
import { bg, getGrayscaleCharacter, ntsc } from "../src/utils";

// console.log("creating Terminal");
const terminal = new Terminal({
  alternateBuffer: true,
  // debugData: true,
  mouseTracking: true,
  cursorHidden: true,
});

let [terminalWidth, terminalHeight] = process.stdout.getWindowSize();
terminal.events.on("resize", (width, height) => {
  terminalWidth = width;
  terminalHeight = height;
});

const glob = new Glob("*.png");

const unsortedFrames = [];

for await (const file of glob.scan("./video")) {
  unsortedFrames.push(file);
}

const frames = unsortedFrames.toSorted((a, b) => {
  const numberA = Number(a.match(/\d+/)![0]);
  const numberB = Number(b.match(/\d+/)![0]);
  return numberA - numberB;
});

let frame = 0;
const nextFrame = () => {
  frame = (frame + 1) % frames.length;
};

const fps = 30;
const frameTime = 1000 / fps;

const draw = async () => {
  const start = Date.now().valueOf();
  const matrix: string[][] = [];
  for (let i = 0; i < terminalHeight; i++) {
    matrix.push(Array(terminalWidth));
  }

  const frameFile = frames[frame];
  const fileStream = fs.createReadStream("./video/" + frameFile);
  const png = await new Promise<PNG>((res, rej) =>
    fileStream
      .pipe(new PNG())
      .on("parsed", function () {
        res(this);
      })
      .on("error", rej)
  );
  for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
      const idx = (png.width * y + x) << 2;

      const r = png.data[idx];
      const g = png.data[idx + 1];
      const b = png.data[idx + 2];
      const grayScale = ntsc(r, g, b);
      const char = getGrayscaleCharacter(grayScale);
      const mx = Math.floor(x * (terminalWidth / png.width));
      const my = Math.floor(y * (terminalHeight / png.height));
      // console.log(mx);
      // console.log(my);
      matrix[my][mx] = char;
    }
  }
  const string = matrix.map((a) => a.join("")).join("\n");
  const output = string.substring(frame.toString().length);
  // terminal.write(myAnsi.eraseInDisplay);
  terminal.printAt(0, 0, output);
  const duration = Date.now().valueOf() - start;
  terminal.printAt(
    0,
    0,
    `${bg("#000000")}Frame: ${frame}/${
      frames.length
    } @${duration} target ${frameTime}`
  );

  nextFrame();
  setTimeout(() => draw(), Math.max(0, frameTime - duration));
};

draw();
