import React, { createContext, useState, useEffect, JSX } from "react";
import { ThemeContextType, Theme, ColorMode } from "@/types/components";

export const ThemeContext = createContext<ThemeContextType | null>(null);

const ThemeProvider = ({
  children,
  theme,
}: {
  children: JSX.Element[];
  theme: Theme;
}) => {
  const [colorMode, rawSetColorMode] = useState(ColorMode.dark);

  const setColorMode = () => {
    rawSetColorMode(
      colorMode === ColorMode.light ? ColorMode.dark : ColorMode.light,
    );
  };

  useEffect(() => {
    const applyColorMode = (variant: ColorMode = ColorMode.light) => {
      Object.entries(theme.colors[variant]).forEach(([key, value]) => {
        document.documentElement.style.setProperty(key, value);
      });
    };

    applyColorMode(colorMode);
  }, [colorMode, theme]);

  return (
    <ThemeContext.Provider value={{ colorMode, setColorMode, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
