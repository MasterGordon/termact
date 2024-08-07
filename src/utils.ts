import type { Border } from "./types/Frame";
import type { Style } from "./types/Style";

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
    const [r, g, b] = args;
    return color(r, g, b);
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

export const bold = () => "\x1b[1m";

export const dim = () => "\x1b[2m";

export const italic = () => "\x1b[3m";

export const underline = () => "\x1b[4m";

export const blink = () => "\x1b[5m";

export const inverse = () => "\x1b[7m";

export const hidden = () => "\x1b[8m";

export const strikethrough = () => "\x1b[9m";

export const doubleUnderline = () => "\x1b[21m";

export const cleanse = (text: string) => text.replace(/\u001b\[.+?m/g, "");

export const frame = (text: string, frame: Border) => {
  const {
    vertical,
    horizontal,
    cornerTopLeft,
    cornerTopRight,
    cornerBottomLeft,
    cornerBottomRight,
  } = frame;

  const textWidth = Math.max(
    ...cleanse(text)
      .split("\n")
      .map((l) => l.length),
  );

  const modifiedText = text
    .split("\n")
    .map((l) => vertical + l.padEnd(textWidth) + vertical)
    .join("\n");
  return `${cornerTopLeft}${horizontal.repeat(textWidth)}${cornerTopRight}
${modifiedText}
${cornerBottomLeft}${horizontal.repeat(textWidth)}${cornerBottomRight}`;
};

export const center = (text: string) => {
  const textWidth = Math.max(...text.split("\n").map((l) => l.length));
  return text
    .split("\n")
    .map((l) => " ".repeat((textWidth - l.length) / 2) + l)
    .join("\n");
};

export const right = (text: string) => {
  const textWidth = Math.max(...text.split("\n").map((l) => l.length));
  return text
    .split("\n")
    .map((l) => l.padStart(textWidth))
    .join("\n");
};

export const moveCursor = (x: number, y: number) => {
  return `\x1b[${y};${x}H`;
};

export const style = (style: Style) => {
  let result = "";
  if (style.fg) result += fg(style.fg);
  if (style.bg) result += bg(style.bg);
  if (style.bold) result += bold();
  if (style.italic) result += italic();
  if (style.underline) result += underline();
  if (style.blink) result += blink();
  if (style.reverse) result += inverse();
  if (style.hidden) result += hidden();
  if (style.strikethrough) result += strikethrough();
  if (style.doubleUnderline) result += doubleUnderline();
  return result;
};

// https://en.wikipedia.org/wiki/Grayscale#Luma_coding_in_video_systems
export const getNtscGrayscale = (r: number, g: number, b: number) => {
  return r * 0.299 + g * 0.587 + b * 0.114;
};

// https://paulbourke.net/dataformats/asciiart/
const grayscaleCharacters =
  "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,\"^`'. "
    .split("")
    .reverse();
export const getGrayscaleCharacter = (brightness: number) => {
  const index = Math.floor((brightness / 255) * grayscaleCharacters.length);
  return grayscaleCharacters[index] || " ";
};

/**
 * Returns an array of characters, each entry contains a character and its escapes
 * example:
 * "\x1b[31mHello\x1b[0m" -> ["\x1b[31mH", "e", "l", "l", "o", "\x1b[0m"]
 */
export const splitCharacters = (text: string) => {
  const result = [];
  let current = "";
  let escape = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char == "\x1b") {
      escape = true;
      current += char;
    } else if (escape) {
      current += char;
      escape = false;
    } else {
      current += char;
      result.push(current);
      current = "";
    }
  }
  return result;
};
