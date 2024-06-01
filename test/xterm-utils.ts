import { Terminal } from "@xterm/headless";

export const writeAsync = (terminal: Terminal, text: string) => {
  return new Promise<void>((resolve) => {
    terminal.write(text, resolve);
  });
};
