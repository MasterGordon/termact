import { Direction } from "yoga-layout";
import type Terminal from "./Terminal";
import type { Node } from "./objects/Box";
import { cleanse, style } from "./utils";

class Renderer {
  private terminal: Terminal;
  private terminalWidth: number;
  private terminalHeight: number;
  private root?: Node;

  constructor(terminal: Terminal) {
    this.terminal = terminal;
    this.registerEvents();
    [this.terminalWidth, this.terminalHeight] = terminal.getSize();
  }

  public setRoot(root: Node) {
    this.root = root;
    this.render();
  }

  public render() {
    this.terminal.clear();
    this.root!.node.calculateLayout(
      this.terminalWidth,
      undefined,
      Direction.LTR,
    );
    this.renderNode(this.root!);
  }

  private renderNode(node: Node) {
    const layout = node.node.getComputedLayout();

    const text = node.text || "";
    const lines = text.split("\n");

    const length = lines.length;
    for (let i = 0; i < layout.height - length; i++) lines.push("");

    lines.forEach((line, index) => {
      const cleansedLength = cleanse(line).length;
      line = style(node.style) + line;
      line += " ".repeat(layout.width - cleansedLength);
      this.terminal.printAt(layout.left, layout.top + index, line);
    });
    if (node.children.length > 0) {
      node.children.forEach((node) => this.renderNode(node));
    }
  }

  private registerEvents() {
    this.terminal.events.on("resize", (width, height) => {
      this.terminalWidth = width;
      this.terminalHeight = height;
      this.render();
    });
  }

  public destroy() {
    this.terminal.destroy();
  }
}

export default Renderer;
