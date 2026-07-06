import { colors } from "@/assets/echarts/colors.json";
import baseTheme from "@/assets/echarts/base.json";
import lightThemeOverrides from "@/assets/echarts/light.json";
import darkThemeOverrides from "@/assets/echarts/dark.json";

const isPlainObject = (value) =>
    value !== null && typeof value === "object" && !Array.isArray(value);

const deepMerge = (target, source) => {
    if (!isPlainObject(source)) {
        return source;
    }

    const merged = isPlainObject(target) ? { ...target } : {};

    Object.entries(source).forEach(([key, value]) => {
        if (isPlainObject(value)) {
            merged[key] = deepMerge(merged[key], value);
            return;
        }

        merged[key] = value;
    });

    return merged;
};

const createTheme = (palette, overrides) => {
    const mergedTheme = deepMerge(baseTheme, overrides);

    return {
        ...mergedTheme,
        color: palette,
        graph: {
            ...(mergedTheme.graph || {}),
            color: palette,
        },
    };
};

export const chartColors = colors;

export const lightTheme = createTheme(colors.light, lightThemeOverrides);
export const darkTheme = createTheme(colors.dark, darkThemeOverrides);

let registered = false;

export const registerEchartsThemes = (echarts) => {
    if (registered) {
        return;
    }

    echarts.registerTheme("light", lightTheme);
    echarts.registerTheme("dark", darkTheme);
    registered = true;
};
