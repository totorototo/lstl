import style from "./style";
import { FunctionComponent, useEffect, useRef, useState } from "react";
import { TimedSection } from "@/types/types";
import * as d3Array from "d3-array";
import { createXScaleBand, createYScale } from "@/helpers/d3";
import { ScaleBand, ScaleLinear } from "d3-scale";
import { smooth } from "@/helpers/smooth";
import { EnhancedPosition } from "@/helpers/trackAnalyzer";
import Section from "@/components/technical/profile/sections/Section";
import { animated, useSprings } from "react-spring";

// eslint-disable-next-line no-extend-native
// @ts-ignore
Array.prototype.groupBy = function <T, K>(
  this: T[],
  fn: (item: T, index: number, array: T[]) => K,
): { [key: string]: T[] } {
  return this.reduce(
    (accu: { [key: string]: T[] }, item: T, index: number, array: T[]) => {
      const key: K = fn(item, index, array);
      // eslint-disable-next-line no-param-reassign
      accu[key as string] = accu[key as string] || [];
      accu[key as string].push(item);
      return accu;
    },
    {},
  );
};

export type ProfileProps = {
  width: number;
  height: number;
  className?: string;
  extrema: EnhancedPosition[];
  enhancedPositions: EnhancedPosition[];
  enhancedCheckpoints: EnhancedPosition[];
  timedSections: TimedSection[];
};

type Domain = {
  x: { min: number; max: number };
  y: { min: number; max: number };
};

type Scales = {
  x: ScaleBand<string>;
  y: ScaleLinear<number, number>;
};

type Area = { path: string | null };

const Profile: FunctionComponent<ProfileProps> = ({
  className,
  width,
  height,
  extrema,
  enhancedPositions,
  enhancedCheckpoints,
  timedSections,
}) => {
  const [domain, setDomain] = useState<Domain>({
    x: { min: 0, max: 0 },
    y: { min: 0, max: 0 },
  });

  const root = useRef(null);
  const [scales, setScales] = useState<Scales | null>(null); // Fixing the type of scales
  const [smoothedElevations, setSmoothedElevations] = useState<number[]>([]);
  const [highlightedSectionIndex, setHighlightedSectionIndex] =
    useState<number>(0);

  const [previousHighlightedSectionIndex, setPreviousHighlightedSectionIndex] =
    useState<number>(0);

  const [data, set] = useState<{ distance: string; elevation: number }[]>([]);

  function computeDelay(index: number): number {
    const direction = highlightedSectionIndex - previousHighlightedSectionIndex;
    const currentSection = timedSections[previousHighlightedSectionIndex];

    if (direction >= 0) {
      const firstSectionKm = currentSection.departure.km * 1; //HACK: convert to number
      if (index < firstSectionKm) {
        return 0;
      }
      return (index - firstSectionKm) * 25;
    }

    const lastSectionKm = currentSection.arrival.km * 1; //HACK: convert to number
    if (index > lastSectionKm) {
      return 0;
    }
    return (data.length - (data.length - lastSectionKm) - index) * 25;
  }

  const [springs] = useSprings(
    data.length,
    (index) => ({
      delay: computeDelay(index),
      // previousHighlightedSectionIndex >= highlightedSectionIndex
      //   ? (data.length - index) * 8
      //   : index * 8, // delay each rectangle by 10ms
      to: {
        fill:
          parseInt(data[index].distance) >=
            timedSections[highlightedSectionIndex].departure.km &&
          parseInt(data[index].distance) <
            timedSections[highlightedSectionIndex].arrival.km
            ? "var(--color-accent)"
            : "var(--color-text)",
      },
    }),
    [highlightedSectionIndex],
  );

  useEffect(() => {
    setPreviousHighlightedSectionIndex(highlightedSectionIndex);
  }, [highlightedSectionIndex, setPreviousHighlightedSectionIndex]);

  // compute domain
  useEffect(() => {
    if (!enhancedPositions || !enhancedPositions.length) return;

    const elevations = enhancedPositions.map(
      (enhancedPosition) => enhancedPosition.position[2],
    );
    const updatedElevations = smooth(elevations, 3);

    setSmoothedElevations(updatedElevations);

    const extentY = d3Array.extent(updatedElevations) as
      | [number, number]
      | undefined; // Type assertion for extentY

    if (extentY) {
      setDomain({
        x: {
          min: 0,
          max: enhancedPositions[enhancedPositions.length - 1].distance,
        },
        y: { min: 0, max: extentY[1] * 1.2 },
      });
    }
  }, [enhancedPositions]);

  useEffect(() => {
    if (!enhancedPositions) return;

    // @ts-ignore
    const groupedEnhancedPositions = enhancedPositions.groupBy(
      (enhancedPosition: EnhancedPosition) =>
        Math.trunc(enhancedPosition.distance / 1000),
    );

    const averagedEnhancedPositions = Object.entries(
      groupedEnhancedPositions,
    ).reduce(
      (accu, [key, value]) => {
        const distance = key;
        const averageElevation = (value as EnhancedPosition[]).reduce(
          (accu, currentValue, index, array) => {
            return (accu + currentValue.position[2]) / 2;
          },
          0,
        );

        return [...accu, { distance, elevation: Math.trunc(averageElevation) }];
      },
      [] as { distance: string; elevation: number }[],
    );

    set(averagedEnhancedPositions);
  }, [enhancedPositions]);

  // compute scales
  useEffect(() => {
    if (!domain || !data) return;

    const x = createXScaleBand(
      data.map((item) => item.distance),
      { min: 0, max: width * 3 },
    );

    const y = createYScale(
      { min: domain.y.min, max: domain.y.max },
      { min: 0, max: height * 0.3 },
    );

    setScales({ x, y });
  }, [width, height, data, domain]);

  return (
    <div className={className} style={{ width, height }}>
      <div className={"sections-container"} ref={root}>
        {timedSections.map((section, index) => (
          <Section
            root={root}
            section={section}
            id={index}
            key={index}
            setHighlightedSectionIndex={setHighlightedSectionIndex}
          />
        ))}
      </div>
      <div className={"svg-container"} style={{ width, height: height * 0.3 }}>
        <svg
          height={height * 0.3}
          width={width * 3}
          viewBox={`0 0 ${width * 3} ${height * 0.3}`}
        >
          <defs>
            <pattern
              id="a"
              patternUnits="userSpaceOnUse"
              width="29"
              height="33.487"
              patternTransform="scale(1) rotate(0)"
            >
              <rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                fill="var(--color-accent)"
              />
              <path
                d="M29 20.928v14.813M14.5 12.56v16.745M29-2.559v6.744l-14.5 8.374L0 4.189v-6.745m29 6.742l14.5 8.37m0 16.745L29 20.928l-14.5 8.376L0 20.931l-14.5 8.376m0-16.744L0 4.189m0 31.487V20.931"
                strokeWidth="3"
                stroke="white"
                fill="var(--color-accent)"
              />
            </pattern>

            <pattern
              id="pattern"
              patternUnits="userSpaceOnUse"
              width="69.282"
              height="40"
            >
              <rect width="69.282" height="40" fill="var(--color-text)"></rect>
              <path
                d="M0,0 l69.282,40 M-34.641,20 l69.282,40 M34.641,-20 l69.282,40"
                stroke="var(--color-accent)"
                strokeWidth="1.5"
                strokeOpacity="1"
              ></path>
            </pattern>
          </defs>
          <g>
            {data &&
              scales &&
              springs.map((props, index) => {
                const item = data[index];
                return (
                  <animated.rect
                    key={index}
                    style={props}
                    x={scales.x(item.distance)}
                    y={scales.y(0)}
                    height={scales.y(item.elevation)}
                    width={scales.x.bandwidth()}
                    stroke={"transparent"}
                    strokeWidth={0}
                  />
                );
              })}
          </g>

          <g>
            {scales &&
              data &&
              enhancedCheckpoints &&
              enhancedCheckpoints.length &&
              enhancedCheckpoints.map((checkpoint, index) => {
                const value = Math.floor(checkpoint.distance / 1000);
                const item = data[value];
                return (
                  <rect
                    key={index}
                    opacity={0.6}
                    fill="var(--color-darken)"
                    stroke={"transparent"}
                    strokeWidth={0}
                    x={scales.x(item.distance)}
                    y={scales.y(0)}
                    height={scales.y(item.elevation)}
                    width={scales.x.bandwidth()}
                  />
                );
              })}
          </g>
        </svg>
      </div>
    </div>
  );
};

export default style(Profile);
