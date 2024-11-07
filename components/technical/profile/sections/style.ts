import { FunctionComponent } from "react";
import styled from "styled-components";
import { SectionProps } from "@/components/technical/profile/sections/Section";

const style = (Component: FunctionComponent<SectionProps>) => styled(Component)`
  height: 100%;
  position: relative;
  scroll-snap-align: center;
  display: flex;

  .detail {
    min-width: 100vw;
    width: 100vw;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-around;
    opacity: 1;
    padding: 1rem;

    .background {
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      z-index: -1;
      overflow: hidden;
      display: flex;
      align-items: flex-end;
      justify-content: flex-end;
      font-size: 6rem;
      letter-spacing: -0.05em;
      min-width: 2rem;
      color: var(--color-darken);
      flex-direction: column;
      gap: 2.4rem;

      span {
        writing-mode: vertical-lr;
        text-orientation: upright;
      }
    }

    .section-data {
      display: flex;
      height: 100%;
      width: 90%;
      align-self: flex-end;

      flex-direction: column;
      align-items: flex-start;
      justify-content: center;

      span:first-child {
        color: var(--color-accent);
        padding-bottom: 2px;
        font-size: 1.4rem;
        line-height: 1.8rem;
        // margin-bottom: 0.2rem;
        // margin-top: 2rem;
      }

      .type {
        font-family: "Montserrat", sans-serif;
        font-size: 1.1rem;
        text-transform: capitalize;
        margin-top: 0.6rem;
        color: var(--color-text);
      }

      span:not(.type, :first-child) {
        margin-bottom: 0.4rem;
        color: var(--color-ligthen);
        font-size: 1.4rem;

        font-family: "Montserrat", sans-serif;
      }
    }
  }
`;

export default style;
