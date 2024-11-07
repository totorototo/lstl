import { describe, expect, it } from "vitest";
import { smooth } from "./smooth";

describe("smooth test suite", () => {
  it("should smooth the array", () => {
    // arrange
    const sample = [1, 2, 3, 4, 5, 4, 5, 6, 7, 8, 9];

    // act
    const result = smooth(sample, 3);

    // assert
    expect(result.length).toEqual(sample.length);
    expect(result).toMatchSnapshot();
  });
});
