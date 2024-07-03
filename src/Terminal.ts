import { LinearScreenBuffer } from "./LinearScreenBuffer";
import EventEmitter from "./lib/EventEmitter";
import type { EventMap } from "./lib/EventEmitter";
import myAnsi, {
  csi,
  decodeButton,
  decodeCtrlInput,
  destructMouseEvent,
  isCtrlInput,
} from "./my-ansi";
import type { Implements } from "./types/Implements";
import uniPrint from "./uni-print";
import { moveCursor, splitCharacters } from "./utils";

interface Modifier {
  shift: boolean;
  meta: boolean;
  ctrl: boolean;
}

type Button = "leftMb" | "middleMb" | "rightMb" | "wheelUp" | "wheelDown";
type Kind = "down" | "up";

type TerminalEvents = Implements<
  {
    resize: [number, number];
    destroy: [];
    mouse: [number, number, Button, Kind, Modifier];
    mouseMove: [number, number];
    text: [string, Modifier];
  },
  EventMap
>;

interface TerminalOptions {
  stdin?: NodeJS.ReadableStream;
  stdout?: NodeJS.WritableStream;
  stderr?: NodeJS.WritableStream;
  alternateBuffer?: boolean;
  mouseTracking?: boolean;
  cursorHidden?: boolean;
  debugData?: boolean;
}

class Terminal {
  private stdin: NodeJS.ReadableStream;
  private stdout: NodeJS.WritableStream;
  private stderr: NodeJS.WritableStream;
  private options: TerminalOptions;
  private screenBuffer: LinearScreenBuffer;

  public events: EventEmitter<TerminalEvents>;

  constructor(options: TerminalOptions = {}) {
    this.stdin = options.stdin || process.stdin;
    this.stdout = options.stdout || process.stdout;
    this.stderr = options.stderr || process.stderr;
    this.options = options;
    const [terminalWidth, terminalHeight] = process.stdout.getWindowSize();
    this.screenBuffer = new LinearScreenBuffer(terminalWidth, terminalHeight);

    this.events = new EventEmitter<TerminalEvents>();

    this.init();
  }

  public write(text: string) {
    if (process.isBun) {
      Bun.write(Bun.stdout, text);
    } else {
      this.stdout.write(text);
    }
  }

  private registerEvents() {
    const dataListener = (data: string) => {
      if (data.length == 1) {
        if (isCtrlInput(data.charCodeAt(0))) {
          this.events.emit("text", decodeCtrlInput(data.charCodeAt(0)), {
            shift: false,
            meta: false,
            ctrl: true,
          });
        }
      }
      if (data.startsWith(csi)) {
        // Mouse tracking
        const destructured = destructMouseEvent(data);
        if (destructured) {
          const decoded = decodeButton(destructured.button);
          if (decoded) {
            if (decoded.button == "move") {
              this.events.emit("mouseMove", destructured.x, destructured.y);
            } else {
              const { button, ...modifier } = decoded;
              this.events.emit(
                "mouse",
                destructured.x,
                destructured.y,
                button,
                destructured.kind == "M" ? "down" : "up",
                modifier,
              );
            }
          }
        }
      }
      if (this.options.debugData) {
        this.stderr.write(uniPrint(data) + "\n");
      }
    };
    const processExitListener = () => {
      this.events.emit("destroy");
    };
    const resizeListener = () => {
      const [terminalWidth, terminalHeight] = process.stdout.getWindowSize();
      this.events.emit("resize", terminalWidth, terminalHeight);
      this.screenBuffer.resize(terminalWidth, terminalHeight);
    };

    process.on("exit", processExitListener);
    this.stdin.on("data", dataListener);
    this.stdout.on("resize", resizeListener);
    this.events.on("destroy", () => {
      this.stdin.off("data", dataListener);
      this.stdin.off("resize", resizeListener);
    });
    this.events.on("text", (text, modifier) => {
      if (modifier.ctrl && text == "c") {
        process.exit();
      }
    });
  }

  public printAt(x: number, y: number, text: string) {
    this.write(`${moveCursor(x + 1, y + 1) + text}\n`);
  }

  private init() {
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding("utf8");

    if (this.options.alternateBuffer) {
      this.write(myAnsi.enableAlternateBuffer);
      this.events.on("destroy", () => {
        this.write(myAnsi.disableAlternateBuffer);
      });
    }

    if (this.options.mouseTracking) {
      this.write(myAnsi.enableMouseTracking);
      this.events.on("destroy", () => {
        this.write(myAnsi.disableMouseTracking);
      });
    }

    if (this.options.cursorHidden) {
      this.write(myAnsi.hideCursor);
      this.events.on("destroy", () => {
        this.write(myAnsi.showCursor);
      });
    }

    this.registerEvents();

    this.events.on("destroy", () => {
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stdin.removeAllListeners();
    });
  }

  public destroy() {
    this.events.emit("destroy");
  }

  public clear() {
    this.write(myAnsi.eraseInDisplay);
  }

  public getSize() {
    return process.stdout.getWindowSize();
  }

  public printAtBuffer(x: number, y: number, text: string) {
    const lines = text.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const chars = splitCharacters(lines[i]);
      for (let j = 0; j < chars.length; j++) {
        this.screenBuffer.set(x + j, y + i, chars[j]);
      }
    }
  }

  public flush() {
    this.printAt(0, 0, this.screenBuffer.toString());
  }
}

export default Terminal;
