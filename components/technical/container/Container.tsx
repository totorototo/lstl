import { forwardRef, ReactNode } from "react";
import styled from "styled-components";

type Ref = HTMLDivElement;

interface Props {
  children?: ReactNode;
  className?: string;
}

const Container = forwardRef<Ref, Props>(({ className, children }, ref) => (
  <div ref={ref} className={className}>
    {children}
  </div>
));

Container.displayName = "Container";

export default styled(Container)`
  font-family: "Press Start 2P", cursive;
  width: 100%;
  position: fixed;
  overflow: hidden;
  overscroll-behavior-y: none;
`;
