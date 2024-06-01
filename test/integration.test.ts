import { Terminal } from "@xterm/headless";
import { test, expect } from "bun:test";
import { frame, reset } from "../src/utils";
import { writeAsync } from "./xterm-utils";

test("integration", async () => {
  const terminal = new Terminal({
    allowProposedApi: true,
    convertEol: true,
  });

  terminal.resize(80, 25);
  await writeAsync(
    terminal,
    frame("My Test\nText\n..............", {
      vertical: "│",
      horizontal: "─",
      cornerTopLeft: "┌",
      cornerTopRight: "┐",
      cornerBottomLeft: "└",
      cornerBottomRight: "┘",
    })
  );

  const activeBuffer = terminal.buffer.active;

  let bufferString = [];
  for (let i = 0; i < activeBuffer.length; i++) {
    bufferString.push(activeBuffer.getLine(i)?.translateToString());
  }
  const screen = bufferString.map((s) => s?.trimEnd());

  expect(screen).toMatchSnapshot();
});
