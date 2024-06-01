import Terminal from "../src/Terminal";
import myAnsi from "../src/my-ansi";

const terminal = new Terminal({
  alternateBuffer: true,
  mouseTracking: true,
  cursorHidden: true,
});

const text = "Hello\nWorld!";
const width = text
  .split("\n")
  .map((l) => l.length)
  .reduce((a, b) => Math.max(a, b));
const height = text.split("\n").length;

let textX = 0;
let textY = 1;
let isDragging = false;
let textDragStartX = 0;
let textDragStartY = 0;
let dragStartX = 0;
let dragStartY = 0;

terminal.events.on("mouse", (x, y, button, kind) => {
  if (button == "leftMb") {
    if (kind == "down") {
      if (x >= textX && x < textX + width && y >= textY && y < textY + height) {
        isDragging = true;
        textDragStartX = x - textX;
        textDragStartY = y - textY;
        dragStartX = textX;
        dragStartY = textY;
      }
    } else if (kind == "up") {
      isDragging = false;
    }
  }
});

terminal.events.on("mouseMove", (x, y) => {
  if (isDragging) {
    textX = x - textDragStartX;
    textY = y - textDragStartY;
    console.log(textX, textY);
    refresh();
  }
});

const refresh = () => {
  terminal.write(myAnsi.eraseInDisplay);
  terminal.printAt(textX, textY, "Hello\nWorld!");
};

refresh();
