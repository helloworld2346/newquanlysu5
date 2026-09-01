import { useCallback, useEffect, useState } from "react";

const THEME_KEY = "theme";

export function useTheme() {
  const [dark, setDark] = useState(
    () => localStorage.getItem(THEME_KEY) === "dark",
  );

  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
  }, [dark]);

  const toggle = useCallback(() => setDark((v) => !v), []);

  return { dark, setDark, toggle };
}
