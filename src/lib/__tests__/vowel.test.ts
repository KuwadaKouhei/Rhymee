import { describe, it, expect } from "vitest";
import { toVowelPattern, countMora } from "../vowel";

describe("toVowelPattern", () => {
  it("トウキョウ → ouou", () => {
    expect(toVowelPattern("トウキョウ")).toBe("ouou");
  });

  it("ニホン → ioN", () => {
    expect(toVowelPattern("ニホン")).toBe("ioN");
  });

  it("ガッコウ → aou (促音スキップ)", () => {
    expect(toVowelPattern("ガッコウ")).toBe("aou");
  });

  it("シャシン → aiN (拗音)", () => {
    expect(toVowelPattern("シャシン")).toBe("aiN");
  });

  it("コーヒー → ooii (長音)", () => {
    expect(toVowelPattern("コーヒー")).toBe("ooii");
  });

  it("サッカー → aaa (促音+長音)", () => {
    expect(toVowelPattern("サッカー")).toBe("aaa");
  });

  it("テレビ → eei", () => {
    expect(toVowelPattern("テレビ")).toBe("eei");
  });

  it("パーティー → aaii (小書き母音+長音)", () => {
    expect(toVowelPattern("パーティー")).toBe("aaii");
  });

  it("空文字列 → 空文字列", () => {
    expect(toVowelPattern("")).toBe("");
  });
});

describe("countMora", () => {
  it("トウキョウ → 4モーラ (キョは1モーラ)", () => {
    expect(countMora("トウキョウ")).toBe(4);
  });

  it("ガッコウ → 4モーラ (促音も1モーラ)", () => {
    expect(countMora("ガッコウ")).toBe(4);
  });

  it("ニホン → 3モーラ", () => {
    expect(countMora("ニホン")).toBe(3);
  });

  it("コーヒー → 4モーラ", () => {
    expect(countMora("コーヒー")).toBe(4);
  });
});
