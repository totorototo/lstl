import path from "path";
import xmldom from "xmldom";
// @ts-ignore
import { gpx } from "@mapbox/togeojson";
import { promises as fs } from "fs";
import { csvParse } from "d3-dsv";
import {
  Checkpoint,
  Kind,
  Section,
  TimedSection,
  TrailRace,
} from "@/types/types";

import { differenceInMilliseconds } from "date-fns";
import { FunctionComponent, useRef } from "react";
import { Container } from "@/components";
import { FeatureCollection, Position } from "geojson";
import { climbpro } from "@/helpers/climbpro";
import { AutoSizer } from "react-virtualized";
import Profile from "@/components/technical/profile/Profile";
import { createTrackAnalyzer, TrackAnalyzer } from "@/helpers/trackAnalyzer";

type SectionStatistics = {
  distance: number;
  gain: number;
  loss: number;
  climb: boolean;
};

function computeTimedSections({
  checkpoints,
  raceStartingDate,
  analyzer,
  coordinates,
}: {
  checkpoints: Checkpoint[];
  raceStartingDate: Date;
  analyzer: TrackAnalyzer;
  coordinates: Position | Position[] | Position[][] | Position[][][];
}): TimedSection[] {
  return checkpoints.reduce(
    (
      timedSections: TimedSection[],
      checkpoint: Checkpoint,
      currentIndex: number,
      array: Checkpoint[],
    ) => {
      if (currentIndex > 0) {
        const openingDate = new Date(array[currentIndex - 1].cutoffTime);
        const closingDate = new Date(checkpoint.cutoffTime);

        const duration = differenceInMilliseconds(closingDate, openingDate);

        const elapsedTime = differenceInMilliseconds(
          closingDate,
          raceStartingDate,
        );

        const openingSectionKilometer = array[currentIndex - 1].km * 1000;
        const closingSectionKilometer = checkpoint.km * 1000;

        /*       // get section waypoints (gpx)
          const sectionWaypointsIndices = helper.getPositionsIndicesAlongPath(
            openingSectionKilometer,
            closingSectionKilometer,
          );

          const wayPoints = coordinates.slice(
            sectionWaypointsIndices[0],
            sectionWaypointsIndices[1],
          );*/

        const sectionEnhancedPositions = analyzer.getSection(
          openingSectionKilometer,
          closingSectionKilometer,
        );

        const wayPoints = sectionEnhancedPositions.map(
          (enhancedPosition) => enhancedPosition.position,
        );

        // get section stats from waypoints (gpx).
        const sectionAnalyzer = createTrackAnalyzer(wayPoints);
        const area = sectionAnalyzer.computeBoundingBox();
        const elevation = sectionAnalyzer.elevation;

        // const sectionHelper = createPathHelper(wayPoints as Path);
        // const area = sectionHelper.calculatePathBoundingBox();
        // const elevation = sectionHelper.calculatePathElevation();

        const slowestAverageSpeed =
          (closingSectionKilometer / elapsedTime) * 3600;

        const timedSection: TimedSection = {
          elapsedTime,
          openingDate: openingDate.toString(),
          closingDate: closingDate.toString(),
          slowestAverageSpeed,
          duration,
          departure: array[currentIndex - 1],
          arrival: checkpoint,
          wayPoints,
          distance: checkpoint.km - array[currentIndex - 1].km,
          elevation: {
            gain: elevation.positive,
            loss: elevation.negative,
          },
          region: {
            maxLatitude: area.maxLatitude,
            maxLongitude: area.maxLongitude,
            minLatitude: area.minLatitude,
            minLongitude: area.minLongitude,
          },
        };

        return [...timedSections, timedSection];
      }
      return timedSections;
    },
    [] as TimedSection[],
  );
}

async function getGeoJson({
  directory,
  filename,
}: {
  directory: string;
  filename: string;
}) {
  // 1- read grp file
  const gpxFilePath = path.join(directory, filename);
  const gpxFileContents = await fs.readFile(gpxFilePath, "utf8");
  const xml = new xmldom.DOMParser().parseFromString(gpxFileContents);
  const geoJson: FeatureCollection = gpx(xml);
  return geoJson;
}

async function getCheckpoints({
  directory,
  filename,
}: {
  directory: string;
  filename: string;
}): Promise<Checkpoint[]> {
  // 2- read csv file
  const csvFilePath = path.join(directory, filename);
  const csvFileContents = await fs.readFile(csvFilePath, {
    encoding: "utf8",
    flag: "r",
  });

  // parse csv file
  const csv = csvParse(csvFileContents);

  // remove header
  const { columns, ...rest } = csv;

  // checkpoints
  return Object.values(rest as unknown as Record<string, Checkpoint>);
}

function computeSections({
  checkpoints,
  analyzer,
  coordinates,
}: {
  checkpoints: Checkpoint[];
  analyzer: TrackAnalyzer;
  coordinates: Position | Position[] | Position[][] | Position[][][];
}) {
  return checkpoints.reduce(
    (
      sections: Section[],
      checkpoint: Checkpoint,
      currentIndex: number,
      array: Checkpoint[],
    ) => {
      if (currentIndex > 0) {
        //do computation (section stats)
        const openingSectionKilometer = array[currentIndex - 1].km * 1000;
        const closingSectionKilometer = checkpoint.km * 1000;

        /*       // get section waypoints (gpx)
        const sectionWaypointsIndices = helper.getPositionsIndicesAlongPath(
          openingSectionKilometer,
          closingSectionKilometer,
        );

        const wayPoints = coordinates.slice(
          sectionWaypointsIndices[0],
          sectionWaypointsIndices[1],
        );*/

        const sectionEnhancedPositions = analyzer.getSection(
          openingSectionKilometer,
          closingSectionKilometer,
        );

        const wayPoints = sectionEnhancedPositions.map(
          (enhancedPosition) => enhancedPosition.position,
        );

        // get section stats from waypoints (gpx).
        const sectionAnalyzer = createTrackAnalyzer(wayPoints);
        const area = sectionAnalyzer.computeBoundingBox();
        const elevation = sectionAnalyzer.elevation;

        // const sectionHelper = createPathHelper(wayPoints as Path);
        // const area = sectionHelper.calculatePathBoundingBox();
        // const elevation = sectionHelper.calculatePathElevation();

        // return computed section
        const section: Section = {
          departure: array[currentIndex - 1],
          arrival: checkpoint,
          wayPoints,
          distance: checkpoint.km - array[currentIndex - 1].km,
          elevation: {
            gain: elevation.positive,
            loss: elevation.negative,
          },
          region: {
            maxLatitude: area.maxLatitude,
            maxLongitude: area.maxLongitude,
            minLatitude: area.minLatitude,
            minLongitude: area.minLongitude,
          },
        };
        return [...sections, section];
      }
      return sections;
    },
    [] as Section[],
  );
}

export async function getStaticProps() {
  const directory = path.join(process.cwd(), "./assets");
  const filename = "lstl";

  // 1- retrieve waypoints from pgx file
  const geoJson = await getGeoJson({ directory, filename: `${filename}.gpx` });

  if ("coordinates" in geoJson.features[0].geometry) {
    const coordinates = geoJson.features[0].geometry.coordinates as [
      number,
      number,
      number,
    ][];

    const reversed = [...coordinates].reverse();
    const global: [number, number, number][] = [...reversed, ...coordinates];

    // 2- retrieve checkpoints from csv file
    const checkpoints = await getCheckpoints({
      directory,
      filename: `${filename}.csv`,
    });

    // trail race stats
    const analyzer = createTrackAnalyzer(global);
    const distance = analyzer.length;
    const elevation = analyzer.elevation;
    const region = analyzer.region;
    const enhancedPositions = analyzer.enhancedPositions;

    /*    const helper = createPathHelper(coordinates);
    const distance = helper.calculatePathLength();
    const elevation = helper.calculatePathElevation();
    const region = helper.calculatePathBoundingBox();*/

    // compute global error (difference between direction race distance and computed one).
    const refDistance = checkpoints[checkpoints.length - 1].km * 1000; // in meters
    const error = distance / refDistance;

    //TODO: update checkpoints with computed error
    const updatedCheckpoints = checkpoints.map((checkpoint) => {
      return {
        ...checkpoint,
        km: Number(checkpoint.km) * error,
      };
    });

    // 3- compute race data (remove checkpoints without associated time barrier).
    const timedCheckpoints: Checkpoint[] = updatedCheckpoints.filter(
      (checkpoint) =>
        checkpoint.cutoffTime && !/^\s*$/.test(checkpoint.cutoffTime),
    );

    // compute all sections
    const sections: Section[] = computeSections({
      checkpoints: updatedCheckpoints,
      analyzer,
      coordinates: global,
    });

    // compute timed sections
    const raceStartingDate = new Date(timedCheckpoints[0].cutoffTime);

    const timedSections = computeTimedSections({
      checkpoints: timedCheckpoints,
      raceStartingDate,
      analyzer,
      coordinates: global,
    });

    // compute stages
    // get checkpoint indices for life bases
    const indices = timedCheckpoints
      .map((timeCheckpoint, currentIndex) =>
        timeCheckpoint.kind === Kind.LIFE_BASE ? currentIndex : undefined,
      )
      .filter(Number) as number[];

    const ck = indices.map((index) => timedCheckpoints[index]);
    ck.push(timedCheckpoints[timedCheckpoints.length - 1]);
    ck.unshift(timedCheckpoints[0]);

    const stages = computeTimedSections({
      checkpoints: ck,
      raceStartingDate,
      analyzer,
      coordinates: global,
    });

    const extrema = climbpro(enhancedPositions);

    // TEMP

    /*
    const sortedExtrema = extrema.sort((a, b) => a - b);

    const stats = extrema.map((index) =>
      helper.getProgressionStatistics(index),
    );

    const climProSections = stats.reduce<SectionStatistics[]>(
      (computedStats, currentStats, currentIndex, stats) => {
        if (currentIndex < stats.length - 1) {
          // compute stats
          const nextStats = stats[currentIndex + 1];
          const distance = nextStats[0] - currentStats[0];
          const gain = nextStats[1] - currentStats[1];
          const loss = nextStats[2] - currentStats[2];

          const temp: SectionStatistics = {
            distance: Number((distance / 1000).toFixed(2)),
            gain,
            loss,
            climb: gain > loss ? true : false,
          };
          // return [...computedStats, { distance }];
          return [...computedStats, temp];
        } else {
          return computedStats;
        }
      },
      [] as SectionStatistics[],
    );

    const distances: number[] = extrema
      .map((index) => {
        const stats = helper.getProgressionStatistics(index);
        return Number((stats[0] / 1000).toFixed(2));
      })
      .sort((a: number, b: number) => a - b);*/

    const enhancedCheckpoints = updatedCheckpoints.map((checkpoint) =>
      analyzer.getEnhancedPositionAt(Number(checkpoint.km) * 1000),
    );

    const race: TrailRace = {
      enhancedCheckpoints, // TODO: to be renamed -> enhanced checkpoints positions
      distance,
      wayPoints: global,
      enhancedPositions,
      elevation: {
        gain: elevation.positive,
        loss: elevation.negative,
      },
      region,
      stages,
      sections,
      timedSections,
      checkpoints: updatedCheckpoints,
      timedCheckpoints,
      extrema,
    };

    return { props: { race } };
  }
}

type AppProps = {
  race: TrailRace;
};

const Home: FunctionComponent<AppProps> = ({ race }) => {
  const container = useRef<HTMLDivElement>(null);

  return (
    <Container ref={container}>
      <AutoSizer>
        {({ width, height }) => (
          <Profile
            timedSections={race.timedSections}
            width={width}
            height={height}
            enhancedPositions={race.enhancedPositions}
            extrema={race.extrema}
            enhancedCheckpoints={race.enhancedCheckpoints}
          />
        )}
      </AutoSizer>
    </Container>
  );
};

export default Home;
