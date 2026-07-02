"import React, { createContext, useContext, useEffect, useState } from \"react\";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem(\"jg_theme\") || \"light\");

  useEffect(() => {
    const root = document.documentElement;
    if (theme === \"dark\") root.classList.add(\"dark\");
    else root.classList.remove(\"dark\");
    localStorage.setItem(\"jg_theme\", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggle: () => setTheme(t => t === \"dark\" ? \"light\" : \"dark\") }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
"