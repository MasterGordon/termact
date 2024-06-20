import type { Node } from "yoga-layout";
import config from "../yoga/config";
import Yoga from "yoga-layout";
import { cleanse } from "../utils";
import type { Style } from "../types/Style";

export class Box {
  public parent?: Box;
  public node: Node;
  public children: Box[];
  public text?: string;
  public style: Style = {};

  constructor() {
    this.node = Yoga.Node.create(config);
    this.children = [];
  }

  public addChild(child: Box) {
    this.children.push(child);
    child.parent = this;
    this.node.insertChild(child.node, this.node.getChildCount());
  }

  public setText(text: string) {
    this.text = text;
    this.node.setWidth(cleanse(text).length);
    this.node.setHeight(text.split("\n").length);
  }
}
