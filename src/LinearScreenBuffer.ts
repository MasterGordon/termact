import { logToFile } from "./lib/logToFile";

export class LinearScreenBuffer {
  private buffer: string[];
  private width: number;
  private height: number;

  constructor(width: number, height: number) {
    this.buffer = Array(height * width).fill(" ");
    this.width = width;
    this.height = height;
  }

  public get(x: number, y: number) {
    return this.buffer[y * this.width + x];
  }

  public set(x: number, y: number, value: string) {
    this.buffer[y * this.width + x] = value;
  }

  public getWidth() {
    return this.width;
  }

  public getHeight() {
    return this.height;
  }

  public resize(width: number, height: number) {
    logToFile("resize");
    if (width * height < this.buffer.length) {
      this.width = width;
      this.height = height;
      return;
    }

    this.buffer = Array(height * width).fill(" ");
    this.width = width;
    this.height = height;
  }

  public clear() {
    this.buffer = this.buffer.fill(" ");
  }

  public toString() {
    let res = "";
    for (let y = 0; y < this.height; y++) {
      res += this.buffer.slice(y * this.width, (y + 1) * this.width).join("");
    }
    return res;
  }
}
