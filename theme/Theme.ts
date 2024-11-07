import { Theme } from "@/types/components";

const THEME: Theme = {
  colors: {
    light: {
      "--color-background": "#252422",
      "--color-text": "#CCC5B9",
      "--color-accent": "#3c67af",
      "--color-ligthen": "#FFFCF2",
      "--color-darken": "#403D39",
    },
    dark: {
      "--color-background": "#252422",
      "--color-text": "#CCC5B9",
      "--color-accent": "#ECA400",
      "--color-ligthen": "#FFFCF2",
      "--color-darken": "#403D39",
    },
  },
  font: {
    family: {
      "--font-family-serif": "'Helvetica', georgia, times, serif",
      "--font-family-sansSerif":
        '"Open+Sans", -apple-system, BlinkMacSystemFont, "Montserrat", "helvetica neue", helvetica, ubuntu, roboto, noto, "segoe ui", arial, sans-serif',
    },
    weights: {
      "--font-weight-bold": "500",
      "--font-weight-medium": "400",
      "--font-weight-light": "300",
    },
    sizes: {
      "--font-size-small": "14px",
      "--font-size": "16px",
      "--font-size-medium": "20px",
    },
  },

  breakpoints: ["40em", "52em", "64em"],
};

export default THEME;
