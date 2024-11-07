import { detectExtrema, Extrema } from "./peak";
import { EnhancedPosition } from "@/helpers/trackAnalyzer";

export const climbpro = function (enhancedPositions: EnhancedPosition[]) {
  const options = {
    lookaround: 90,
    sensitivity: 0.25,
    coalesce: 10,
  };
  const peaks = detectExtrema({
    data: enhancedPositions,
    options,
    extrema: Extrema.Maxima,
  });

  const valleys = detectExtrema({
    data: enhancedPositions,
    options,
    extrema: Extrema.Minima,
  });

  return [...peaks, ...valleys];
};
