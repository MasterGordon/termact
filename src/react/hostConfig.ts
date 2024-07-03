import type { HostConfig } from "react-reconciler";
import { Node } from "../objects/Box";

type NodeType = "text" | "box";
type Props = Record<string, string>;
/** The type of the root container. */
type RootContainer = Node;
type Instance = Node;
type TextInstance = Node;

interface HostContext {}

interface UpdatePayload {
  props: Props;
}

type TermactHostConfig = HostConfig<
  NodeType,
  Props,
  RootContainer,
  Instance,
  TextInstance,
  unknown,
  unknown,
  unknown,
  HostContext,
  UpdatePayload,
  unknown,
  unknown,
  unknown
>;

// @ts-expect-error TODO: fix this
const hostConfig: TermactHostConfig = {};
