export const hasColorSupport = () => {
  return (
    process.env.COLORTERM === "truecolor" || process.env.COLORTERM === "24bit"
  );
};

export const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  return [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16),
  ] as const;
};

export const rgbToHex = (r: number, g: number, b: number) => {
  return `#${r.toString(16).padStart(2, "0")}${g
    .toString(16)
    .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
};

const color = (r: number, g: number, b: number, bg?: boolean) =>
  `\x1b[${bg ? "48" : "38"};2;${r};${g};${b}m`;

export const fg = (args: [number, number, number] | string) => {
  if (typeof args === "string") {
    return color(...hexToRgb(args));
  } else {
    return color(...args);
  }
};

export const bg = (args: [number, number, number] | string) => {
  if (typeof args === "string") {
    return color(...hexToRgb(args), true);
  } else {
    return color(...args, true);
  }
};

export const reset = () => "\x1b[0m";
