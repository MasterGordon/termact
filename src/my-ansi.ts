export const csi = "\x1b[";
export const regexEscapedCsi = "\x1b\\[";

export const buttonsMask = {
  wheelUp: 64,
  wheelDown: 65,
  rightMb: 2,
  middleMb: 1,
  leftMb: 0,
} as const;

export const modifiersMask = {
  shift: 4,
  meta: 8,
  ctrl: 16,
};

const mouseEventRegex = new RegExp(
  `${regexEscapedCsi}<(\\d+);(\\d+);(\\d+)(M|m)$`
);

export const destructMouseEvent = (data: string) => {
  const match = mouseEventRegex.exec(data);
  if (match) {
    return {
      button: parseInt(match[1]),
      x: parseInt(match[2]),
      y: parseInt(match[3]),
      kind: match[4] as "M" | "m",
    };
  } else {
    return undefined;
  }
};

export const decodeButton = (code: number) => {
  const codeWithoutModifiers =
    code & ~(modifiersMask.shift | modifiersMask.meta | modifiersMask.ctrl);
  const button =
    Object.keys(buttonsMask).find(
      (k) => buttonsMask[k as keyof typeof buttonsMask] == codeWithoutModifiers
    ) ||
    ((codeWithoutModifiers & 32) == 32 // move
      ? "move"
      : undefined);

  if (button) {
    return {
      button: button as keyof typeof buttonsMask | "move",
      shift: !!(code & modifiersMask.shift),
      meta: !!(code & modifiersMask.meta),
      ctrl: !!(code & modifiersMask.ctrl),
    };
  } else {
    return undefined;
  }
};

export const isCtrlInput = (code: number) => code < 32;

export const decodeCtrlInput = (code: number) => {
  if (code == 0) return "@";
  else if (code == 27) return "[";
  else if (code == 28) return "\\";
  else if (code == 29) return "]";
  else if (code == 30) return "^";
  else if (code == 31) return "_";
  return String.fromCharCode(code + 64).toLowerCase();
};

const myAnsi = {
  // 1000 VT200 normal mouse tracking
  // 1006 SGR Extended coordinates
  // 1003 Any-event tracking
  enableMouseTracking: csi + "?1000;1006;1003h",
  disableMouseTracking: csi + "?1000;1006;1003l",
  enableAlternateBuffer: csi + "?1049h",
  disableAlternateBuffer: csi + "?1049l",
  hideCursor: csi + "?25l",
  showCursor: csi + "?25h",
  eraseInDisplay: csi + "2J",
} as const;

export default myAnsi;
