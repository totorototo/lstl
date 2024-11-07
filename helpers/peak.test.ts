import { detectExtrema, Extrema } from "./peak";
import { describe, expect, it } from "vitest";

describe("detect extrema test suite", () => {
  const data = [20, 100, 150, 100, 20]; // Sample data

  const options = {
    lookaround: 2,
    sensitivity: 0.9,
    coalesce: 0,
  };

  it("should find peaks", () => {
    // act
    const result = detectExtrema({
      extrema: Extrema.Maxima,
      data,
      options,
    });

    // assert
    expect(result.indices).toHaveLength(1);
    expect(result.indices).toEqual(expect.arrayContaining([2]));
  });

  it("should find valleys", () => {
    // act
    const result = detectExtrema({
      extrema: Extrema.Minima,
      data,
      options,
    });

    // assert
    expect(result.indices).toHaveLength(2);
    expect(result.indices).toEqual(expect.arrayContaining([0, 4]));
  });
});
