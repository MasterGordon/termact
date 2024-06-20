import { Glob } from "bun";
import Terminal from "../src/Terminal";
import { PNG } from "pngjs";
import sharp from "sharp";
import {
  bg,
  bold,
  fg,
  getGrayscaleCharacter,
  getNtscGrayscale,
  reset,
} from "../src/utils";
import { Readable } from "stream";
import myAnsi from "../src/my-ansi";

// console.log("creating Terminal");
const terminal = new Terminal({
  alternateBuffer: true,
  // debugData: true,
  mouseTracking: true,
  cursorHidden: true,
});

let [terminalWidth, terminalHeight] = process.stdout.getWindowSize();
terminal.events.on("resize", (width, height) => {
  terminal.write(myAnsi.eraseInDisplay);
  terminalWidth = width;
  terminalHeight = height;
});

terminal.events.on("mouse", (x, y, button, kind) => {
  if (button == "leftMb") {
    if (kind == "down") {
      if (y == terminalHeight - 3) {
        frame = Math.floor((x / terminalWidth) * frames.length);
      }
      if (y == terminalHeight - 2 && x >= 0 && x <= 2) {
        playing = !playing;
      }
    }
  }
});

const play = " ";
const pause = " ";

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
let playing = true;
const nextFrame = () => {
  frame = (frame + 1) % frames.length;
};

const fps = Number(process.argv[2]);
const frameTime = 1000 / fps;

const framesToTime = (frames: number) => {
  const seconds = Math.floor(frames / fps);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const draw = async () => {
  const canvasWidth = terminalWidth;
  const canvasHeight = terminalHeight - 3;

  let resizePipeline = sharp()
    .resize(canvasWidth, canvasHeight, {
      fit: "fill",
    })
    .png();
  const start = Date.now().valueOf();
  const matrix: string[][] = [];
  for (let i = 0; i < canvasHeight; i++) {
    matrix.push(Array(canvasWidth));
  }

  const frameFile = frames[frame];
  const png = await new Promise<PNG>((res, rej) =>
    Readable.fromWeb(Bun.file("./video/" + frameFile).stream())
      .pipe(resizePipeline)
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
      const grayScale = getNtscGrayscale(r, g, b);
      const char = getGrayscaleCharacter(grayScale);
      matrix[y][x] = fg([r, g, b]) + char;
    }
  }
  const string = matrix.map((a) => a.join("")).join("\n");
  const output = string.substring(frame.toString().length);
  // terminal.write(myAnsi.eraseInDisplay);
  const durationWithoutPrint = Date.now().valueOf() - start;
  terminal.printAt(0, 0, output);
  const duration = Date.now().valueOf() - start;
  terminal.printAt(
    0,
    0,
    `${bg("#000000")}${fg("#ffffff")}Frame: ${frame}/${
      frames.length
    } @${duration} @@${durationWithoutPrint} target ${frameTime} ${
      png.height
    }x${png.width} ${canvasWidth}x${canvasHeight}`
  );

  const progress = frame / frames.length;
  const barLength = Math.floor(progress * terminalWidth);
  const rest = terminalWidth - barLength;
  const progressBar = `${fg("#86efac")}${bold()}${"-".repeat(
    barLength
  )}${reset()}${bg("#000000")}${fg("#ffffff")}●${"-".repeat(rest - 1)}`;
  terminal.printAt(0, canvasHeight, progressBar);
  const time = `${fg("#ffffff")}${framesToTime(frame)}/${framesToTime(
    frames.length
  )}`;
  terminal.printAt(0, canvasHeight + 1, ` ${playing ? pause : play}${time}`);

  if (playing) {
    nextFrame();
  }
  setTimeout(() => draw(), Math.max(0, frameTime - duration));
};

draw();
