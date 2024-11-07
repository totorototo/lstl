import { Position } from "geojson";
import { EnhancedPosition } from "@/helpers/trackAnalyzer";

export type Longitude = number;
export type Latitude = number;
export type altitude = number;
export type Coordinate = [Longitude, Latitude, altitude];

export type Region = {
  minLongitude: number;
  maxLongitude: number;
  minLatitude: number;
  maxLatitude: number;
};

export type Elevation = {
  gain: number;
  loss: number;
};

export enum Kind {
  LIFE_BASE = "life base",
  REFUELING = "refueling",
}

export type Checkpoint = {
  location: string;
  label: string;
  km: number;
  cutoffTime: string; // would be an empty string if no time barrier ->see csv parser default behaviour
  kind: Kind;
};

export type Section = {
  departure: Checkpoint;
  arrival: Checkpoint;
  wayPoints: Position | Position[] | Position[][] | Position[][][];
  distance: number;
  elevation: Elevation;
  region: Region;
};

export type TimedSection = Section & {
  openingDate: string; // latest opening date
  closingDate: string;
  duration: number;
  slowestAverageSpeed: number;
  elapsedTime: number;
};

export type TrailRace = {
  enhancedCheckpoints: EnhancedPosition[];
  enhancedPositions: EnhancedPosition[];
  distance: number;
  elevation: Elevation;
  region: Region;
  wayPoints: Position | Position[] | Position[][] | Position[][][];
  stages: TimedSection[];
  sections: Section[];
  timedSections: TimedSection[];
  checkpoints: Checkpoint[];
  timedCheckpoints: Checkpoint[];
  extrema: EnhancedPosition[];
};
