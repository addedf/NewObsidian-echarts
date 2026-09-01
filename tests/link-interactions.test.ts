import { describe, expect, it } from "vitest";

import {
  getLinkedNoteTarget,
  getNativeMouseEvent,
  normalizeInternalLink,
} from "../src/link-interactions";

describe("normalizeInternalLink", () => {
  it.each([
    ["[[事件笔记]]", "事件笔记"],
    ["[[文件夹/事件笔记#结论|预览事件]]", "文件夹/事件笔记#结论"],
    ["![[事件笔记#^block-id]]", "事件笔记#^block-id"],
    [" 文件夹/普通路径 ", "文件夹/普通路径"],
  ])("normalizes %s", (input, expected) => {
    expect(normalizeInternalLink(input)).toBe(expected);
  });

  it.each([
    null,
    12,
    "",
    "[[ ]]",
    "[[未闭合",
    "多行\n链接",
    "https://example.com",
    "obsidian://open?vault=test",
    "//example.com/note",
  ])("rejects unsafe or invalid target %#", (input) => {
    expect(normalizeInternalLink(input)).toBeNull();
  });
});

describe("getLinkedNoteTarget", () => {
  it("reads note from regular and markPoint-style data items", () => {
    expect(getLinkedNoteTarget({ value: 42, note: "[[事件笔记]]" })).toBe(
      "事件笔记",
    );
    expect(
      getLinkedNoteTarget({ coord: ["2026-08-31", 104], note: "事件笔记" }),
    ).toBe("事件笔记");
  });

  it("ignores values without a valid note", () => {
    expect(getLinkedNoteTarget(["not", "an", "object"])).toBeNull();
    expect(getLinkedNoteTarget({ value: 42 })).toBeNull();
  });
});

describe("getNativeMouseEvent", () => {
  it("returns a structurally valid native mouse event", () => {
    const event = {
      clientX: 12,
      clientY: 34,
      preventDefault: () => undefined,
    };

    expect(getNativeMouseEvent({ event: { event } })).toBe(event);
  });

  it("rejects missing and non-mouse events", () => {
    expect(getNativeMouseEvent({})).toBeNull();
    expect(
      getNativeMouseEvent({ event: { event: { clientX: "12" } } }),
    ).toBeNull();
  });
});
