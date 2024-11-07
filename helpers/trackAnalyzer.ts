import { computeDistance } from "@/helpers/positionHelper";
import { stat } from "node:fs";
import { smooth } from "@/helpers/smooth";

type Position = [number, number, number];

export type EnhancedPosition = {
  position: Position;
  distance: number;
};

export type Area = {
  minLongitude: number;
  maxLongitude: number;
  minLatitude: number;
  maxLatitude: number;
};

type Elevation = { positive: number; negative: number };

export type TrackAnalyzer = {
  elevation: Elevation;
  length: number;
  region: Area;
  enhancedPositions: EnhancedPosition[];
  // findClosestPosition: (position: Position) => Position;
  getSection: (start: number, end: number) => EnhancedPosition[];
  computeBoundingBox: () => Area;
  getEnhancedPositionAt: (distance: number) => EnhancedPosition;
};

export const createTrackAnalyzer = (positions: Position[]): TrackAnalyzer => {
  const addMetaData = () => {
    let distance = 0;
    return positions.reduce(
      (
        enhancedPositions: EnhancedPosition[],
        currentPosition,
        index,
        array,
      ) => {
        if (index < array.length - 1) {
          const distanceBetweenPosition = computeDistance(
            currentPosition,
            array[index + 1],
          );
          const enhancedPosition = { position: currentPosition, distance };
          distance += distanceBetweenPosition;

          return [...enhancedPositions, enhancedPosition];
        }

        return enhancedPositions;
      },
      [] as EnhancedPosition[],
    );
  };
  const getLength = (): number =>
    positions.reduce(
      (distance, position, index, array) =>
        index < array.length - 1
          ? distance + computeDistance(position, array[index + 1])
          : distance,
      0,
    );

  const findClosestPosition = (currentPosition: Position): Position => {
    const closestLocation = positions.reduce(
      (accum, position) => {
        const distance = computeDistance(position, currentPosition);

        if (distance < accum.distance) {
          accum.distance = distance;
          accum.position = position;
        }
        return accum;
      },
      {
        position: positions[0],
        distance: computeDistance(currentPosition, positions[0]),
      },
    );
    return closestLocation.position;
  };

  const computeBoundingBox = (): Area => {
    return positions.reduce(
      (region, position) => ({
        minLongitude: Math.min(position[0], region.minLongitude),
        maxLongitude: Math.max(position[0], region.maxLongitude),
        minLatitude: Math.min(position[1], region.minLatitude),
        maxLatitude: Math.max(position[1], region.maxLatitude),
      }),
      {
        minLongitude: positions[0]?.[0] ? positions[0][0] : 0,
        maxLongitude: positions[0]?.[0] ? positions[0][0] : 0,
        minLatitude: positions[0]?.[1] ? positions[1][0] : 0,
        maxLatitude: positions[0]?.[1] ? positions[1][0] : 0,
      },
    );
  };

  const computeElevation = (): Elevation => {
    const elevations = positions.map((position) => position[2]);
    const smoothElevations = smooth(elevations, 3);
    return smoothElevations.reduce(
      (elevationGain, elevation, index, values) => {
        if (values[index + 1]) {
          const delta = values[index + 1] - elevation;
          if (delta > 0) {
            elevationGain.positive = elevationGain.positive + delta;
          } else {
            elevationGain.negative = elevationGain.negative + Math.abs(delta);
          }
          return elevationGain;
        }
        return elevationGain;
      },
      { positive: 0, negative: 0 },
    );
  };

  const enhancedPositions = addMetaData();

  const findClosestEnhancedPosition = (
    distance: number,
  ): { position: EnhancedPosition; index: number } => {
    return enhancedPositions.reduce(
      (previousValue, currentValue, currentIndex, array) => {
        return Math.abs(currentValue.distance - distance) <
          Math.abs(previousValue.position.distance - distance)
          ? { position: currentValue, index: currentIndex }
          : previousValue;
      },
      { position: enhancedPositions[0], index: 0 },
    );
  };

  const getSection = (start: number, stop: number) => {
    const first = findClosestEnhancedPosition(start);
    const second = findClosestEnhancedPosition(stop);

    //slice
    return enhancedPositions.slice(first.index, second.index);
  };

  const getEnhancedPositionAt = (distance: number): EnhancedPosition => {
    const item = findClosestEnhancedPosition(distance);
    return item.position;
  };

  return {
    length: getLength(),
    enhancedPositions,
    getSection,
    getEnhancedPositionAt,
    computeBoundingBox,
    elevation: computeElevation(),
    region: computeBoundingBox(),
  };
};
