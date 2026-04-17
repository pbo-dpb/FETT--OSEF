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
    const key =
        latestAsOfKeyByMetric[preferredMetric] || latestAsOfKeyByMetric.fte;
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

    const fiscalDivision = language === "fr" ? "T" : "Q";
    let preposition = "";

    if (language === "fr") {
        if (preferredGranularity === "quarter") {
            preposition = "au";
        } else {
            preposition = "en";
        }
    }

    const dateString =
        preferredGranularity === "quarter"
            ? `${preposition} ${fiscalDivision}${quarter} ${year}`
            : `${preposition} ${year}-${year + 1}`;

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
