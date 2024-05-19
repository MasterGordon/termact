import { test, expect, it } from "bun:test";
import { bg, bold, center, fg, frame, reset, right } from "../src/utils";
import type { Frame } from "../src/types/Frame";

test("colors", () => {
  const res = `${bg("#ff0000")}${fg("#f0f0f0")}${bold()}Hello world${reset()}`;

  expect(res).toMatchSnapshot();
});

test("frame", () => {
  const frameConfig: Frame = {
    vertical: "│",
    horizontal: "─",
    cornerTopLeft: "┌",
    cornerTopRight: "┐",
    cornerBottomLeft: "└",
    cornerBottomRight: "┘",
  };

  const res = frame("Hello world", frameConfig);

  expect(res).toMatchSnapshot();
});

test("center", () => {
  const res = center("Hello world\nTest\n12345");

  expect(res).toMatchSnapshot();
});

test("right", () => {
  const res = right("Hello world\nTest\n12345");

  expect(res).toMatchSnapshot();
});
