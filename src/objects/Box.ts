export class Box {
  public x: number;
  public y: number;
  public position: "relative" | "absolute";
  public parent?: Box;
  public children: (Box | string)[];

  constructor(x: number, y: number, position: "relative" | "absolute") {
    this.x = x;
    this.y = y;
    this.position = position;
    this.children = [];
  }
}
