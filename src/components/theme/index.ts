// Barrel for the theme system (same pattern as notifications/index.ts).
// ThemeProvider only imports from "@/lib/theme" — nothing here imports back
// through this barrel — so re-exporting creates no circular-import risk.
export { ThemeProvider, useTheme } from "./ThemeProvider";
