import { max, min, deviation, mean, leastIndex, range, pairs } from "d3-array";
import { EnhancedPosition } from "@/helpers/trackAnalyzer";

// Enum for extrema types
export enum Extrema {
  Minima,
  Maxima,
}

// Options interface for detectExtrema function
interface DetectExtremaOptions {
  lookaround: number;
  sensitivity: number;
  coalesce: number;
}

// Parameters interface for detectExtrema function
interface DetectExtremaParams {
  extrema: Extrema;
  data: EnhancedPosition[];
  accessor?: (d: any) => EnhancedPosition;
  options?: DetectExtremaOptions;
}

// Function to detect extrema
export const detectExtrema = ({
  extrema,
  data,
  accessor,
  options = {
    lookaround: 2,
    sensitivity: 1.4,
    coalesce: 0,
  },
}: DetectExtremaParams): EnhancedPosition[] => {
  // Validate input parameters
  if (!data || !Array.isArray(data) || data.length < 3) {
    throw new Error("Invalid input data");
  }

  // Validate accessor function
  if (accessor && typeof accessor !== "function") {
    throw new Error("Accessor must be a function");
  }

  // Initialize values array based on accessor function
  const values: EnhancedPosition[] = accessor ? data.map(accessor) : data;

  // Normalize values
  const normalizedValues = normalize(values.map((value) => value.position[2]));

  // Calculate scores
  const scores = calculateScores(extrema, normalizedValues, options);

  // Find extrema candidates
  const candidates = findCandidates(extrema, scores, options);

  // Group nearby extrema
  const groups = groupExtrema(candidates, options.coalesce);

  // Find indices of detected extrema
  const indices = findIndices(
    extrema,
    groups,
    values.map((value) => value.position[2]),
  );

  const buff = indices.map((index) => data[index]);
  return buff;
  // return {
  //   item: buff,
  //   /* data,
  //   values,
  //   normalizedValues,
  //   scores,
  //   candidates,
  //   groups,
  //   indices,*/
  // };
};

// Calculate scores based on extrema type
const calculateScores = (
  extrema: Extrema,
  values: number[],
  options: DetectExtremaOptions,
) => {
  return values.map((value, index) => {
    const left = values.slice(Math.max(0, index - options.lookaround), index);
    const right = values.slice(index + 1, index + options.lookaround + 1);

    return extrema === Extrema.Maxima
      ? peakiness(left, value, right)
      : lowness(left, value, right);
  });
};

// Find extrema candidates based on scores and sensitivity
const findCandidates = (
  extrema: Extrema,
  scores: number[],
  options: DetectExtremaOptions,
) => {
  return range(scores.length).filter((index) =>
    extrema === Extrema.Maxima
      ? scores[index] > options.sensitivity
      : scores[index] < -options.sensitivity,
  );
};

// Group nearby extrema based on coalesce distance
const groupExtrema = (candidates: number[], coalesce: number) => {
  const groups: number[][] = [];

  let currentGroup: number[] = [];
  candidates.forEach((candidate, index) => {
    if (index === 0 || candidate - candidates[index - 1] <= coalesce) {
      currentGroup.push(candidate);
    } else {
      groups.push([...currentGroup]);
      currentGroup = [candidate];
    }
  });

  if (currentGroup.length > 0) {
    groups.push([...currentGroup]);
  }

  return groups;
};

// Find indices of detected extrema
const findIndices = (
  extrema: Extrema,
  groups: number[][],
  values: number[],
) => {
  return groups.map((group) => {
    const index =
      extrema === Extrema.Maxima
        ? leastIndex(group, (a, b) => values[b] - values[a])
        : leastIndex(group, (a, b) => values[a] - values[b]);

    // @ts-ignore
    return group[index];
  });
};

// Auxiliary functions for calculating peakiness and lowness
const peakiness = (left: number[], value: number, right: number[]) => {
  const leftMin = min(left) ?? 0;
  const rightMin = min(right) ?? 0;
  // @ts-ignore
  return value - max([leftMin, rightMin]);
};

const lowness = (left: number[], value: number, right: number[]) => {
  const leftMax = left.length > 0 ? max(left) ?? 0 : 0;
  const rightMax = right.length > 0 ? max(right) ?? 0 : 0;
  // @ts-ignore
  return value - min([leftMax, rightMax]);
};

// Normalize an array of numbers
const normalize = (xs: number[]) => {
  if (!xs.length) return [];
  const meanb = mean(xs) ?? 0;
  const stdev = deviation(xs) ?? 1;
  return xs.map((x) => (x - meanb) / stdev);
};
