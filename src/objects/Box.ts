import type { Node as YogaNode } from "yoga-layout";
import config from "../yoga/config";
import Yoga, { Edge } from "yoga-layout";
import { cleanse } from "../utils";
import type { Style } from "../types/Style";
import type { Border } from "../types/Frame";

export class Node {
  public parent?: Node;
  public node: YogaNode;
  public children: Node[];
  public text?: string;
  public border?: Border;
  public style: Style = {};

  constructor() {
    this.node = Yoga.Node.create(config);
    this.children = [];
  }

  public addChild(child: Node) {
    this.children.push(child);
    child.parent = this;
    this.node.insertChild(child.node, this.node.getChildCount());
  }

  public setText(text: string) {
    this.text = text;
    const lines = text.split("\n");
    const linesCleansed = lines.map(cleanse);
    const width = linesCleansed.reduce((a, b) => Math.max(a, b.length), 0);
    this.node.setWidth(width);
    this.node.setHeight(linesCleansed.length);
  }

  public setBorder(border: Border) {
    this.border = border;
    this.node.setBorder(Edge.All, 1);
  }
}
