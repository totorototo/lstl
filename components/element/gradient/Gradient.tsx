import { LinearGradient } from "@visx/gradient";
import React from "react";

const Gradient = ({
  id = "oops",
  from = "#F4A301",
  to = "#F4A301",
  toOffset = "10%",
  ...restProps
}) => {
  return (
    <LinearGradient
      id={id}
      from={from}
      to={to}
      toOffset={toOffset}
      {...restProps}
    />
  );
};

export default Gradient;
