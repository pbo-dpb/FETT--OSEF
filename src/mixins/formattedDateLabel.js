import enStrings from "../assets/strings/en.json";
import frStrings from "../assets/strings/fr.json";

const localeStrings = {
    en: enStrings,
    fr: frStrings,
};

const latestAsOfKeyByMetric = {
    pop: "department_latest_pops_as_of",
    fte: "department_latest_ftes_as_of",
};

export const getLatestAsOfString = (preferredMetric, language = "en") => {
    const key = latestAsOfKeyByMetric[preferredMetric] || latestAsOfKeyByMetric.fte;
    return localeStrings[language]?.[key] || "";
};

export const formatAsOfDateLabel = ({
    preferredMetric,
    preferredGranularity,
    language,
    strings,
    year,
    quarter,
}) => {
    if (!year) return "";

    const prefix = language === "fr" ? "T" : "Q";
    const dateString =
        preferredGranularity === "quarter"
            ? `${prefix}${quarter} ${year}`
            : `${year}`;

    // Try to get template from imported locale first, fall back to passed-in strings
    const templateString =
        getLatestAsOfString(preferredMetric, language) ||
        strings?.[latestAsOfKeyByMetric[preferredMetric]];

    return templateString?.replace("{date}", dateString) || "";
};

export default {
    methods: {
        formatAsOfDateLabel,
        getLatestAsOfString,
    },
};
