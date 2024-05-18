const csi = "\x1b[";

export const buttonsMask = {
  leftMb: 0,
  middleMb: 1,
  rightMb: 2,
  wheelUp: 64,
  wheelDown: 65,
} as const;

export const modifiersMask = {
  shift: 4,
  meta: 8,
  ctrl: 16,
};

export const decodeButton = (code: number) => {
  const button = Object.keys(buttonsMask).find(
    (k) => buttonsMask[k as keyof typeof buttonsMask] & code
  );

  if (button) {
    return {
      button,
      shift: code & modifiersMask.shift,
      meta: code & modifiersMask.meta,
      ctrl: code & modifiersMask.ctrl,
    };
  } else {
    return undefined;
  }
};

const myAnsi = {
  // 1000 VT200 normal mouse tracking
  // 1006 SGR Extended coordinates
  // 1003 Any-event tracking
  enableMouseTracking: csi + "?1000;1006;1003h",
  disableMouseTracking: csi + "?1000;1006;1003l",
} as const;

export default myAnsi;
