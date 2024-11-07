import * as scale from "d3-scale";
import * as shape from "d3-shape";
import * as d3Array from "d3-array";
import { ScaleLinear } from "d3-scale";
import { Line, Area } from "d3-shape";
import { EnhancedPosition } from "@/helpers/trackAnalyzer";

const d3 = {
  scale,
  shape,
  d3Array,
};

export const createXScaleBand = (
  domain: string[],
  range = { min: 0, max: 0 },
) => {
  return d3.scale
    .scaleBand()
    .domain(domain)
    .range([range.min, range.max])
    .padding(0.2);
};

export const createXScale = (
  domain = { min: 0, max: 0 },
  range = { min: 0, max: 0 },
) => {
  return d3.scale
    .scaleLinear()
    .domain([domain.min, domain.max])
    .range([range.min, range.max]);
};

export const createYScale = (
  domain = { min: 0, max: 0 },
  range = { min: 0, max: 0 },
) => {
  return (
    d3.scale
      .scaleLinear()
      .domain([domain.min, domain.max])
      // We invert our range so it outputs using the axis that React uses.
      .range([range.min, range.max])
  );
};

export const getArea = (
  enhancedPositions: EnhancedPosition[],
  scaleX: ScaleLinear<number, number>,
  scaleY: ScaleLinear<number, number>,
  domainMin: number,
) => {
  const areaShape = d3.shape
    .area<EnhancedPosition>() // Specify the type for area function
    .x((enhancedPosition) => scaleX(enhancedPosition.distance))
    .y1((enhancedPosition) => scaleY(enhancedPosition.position[2]))
    .y0(scaleY(domainMin))
    //.defined((d) => !d.fake)
    .curve(d3.shape.curveLinear) as Area<EnhancedPosition>;

  return {
    path: areaShape(enhancedPositions),
  };
};
export const getLine = (
  points: [number, number, number][],
  scaleX: ScaleLinear<number, number>,
  scaleY: ScaleLinear<number, number>,
) => {
  const lineShape = d3.shape
    .line<[number, number, number]>() // Specify the type for line function
    .x((_, i) => scaleX(i))
    .y((d) => scaleY(d[2]))
    //.defined((d) => !d.fake)
    .curve(d3.shape.curveCatmullRom.alpha(0.5)) as Line<
    [number, number, number]
  >;

  return {
    path: lineShape(points),
  };
};
/*
export const getLines = (
  points: { x: number; y: number }[],
  scaleX: ScaleLinear<number, number>,
  scaleY: ScaleLinear<number, number>,
) => {
  return points.map((point) => {
    const lineShape = d3.shape
      .line() // Specify the type for the line function
      .x((d) => scaleX(d.x))
      .y((d) => scaleY(d.y));

    return {
      // @ts-ignore
      path: lineShape(point),
    };
  });
};
*/
