import { test, expect, it } from "bun:test";
import { cleanse, splitCharacters } from "../src/utils";

test("splitCharacters", () => {
  it("should split characters", () => {
    const res = splitCharacters("Hello world");

    expect(res).toEqual([
      "H",
      "e",
      "l",
      "l",
      "o",
      " ",
      "w",
      "o",
      "r",
      "l",
      "d",
    ]);
  });

  it("should split characters with escape", () => {
    const res = splitCharacters("\x1b[31mHello world\x1b[0m");

    expect(res).toEqual([
      "\x1b[31mH",
      "e",
      "l",
      "l",
      "o",
      " ",
      "w",
      "o",
      "r",
      "l",
      "d",
      "\x1b[0m",
    ]);
  });
});

test("cleanse", () => {
  it("should cleanse", () => {
    const res = cleanse("\x1b[31mHello world\x1b[0m");

    expect(res).toEqual("Hello world");
  });

  it("should not cleanse", () => {
    const res = cleanse("Hello world");

    expect(res).toEqual("Hello world");
  });
});
