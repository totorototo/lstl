export type Theme = {
  colors: {
    light: Record<string, string>;
    dark: Record<string, string>;
  };
  font: {
    family: Record<string, string>;
    weights: Record<string, string>;
    sizes: Record<string, string>;
  };
  breakpoints: string[];
};

export enum ColorMode {
  light = "light",
  dark = "dark",
}

export type ThemeContextType = {
  colorMode: ColorMode;
  setColorMode: (mode: ColorMode) => void;
  theme: Theme;
};
