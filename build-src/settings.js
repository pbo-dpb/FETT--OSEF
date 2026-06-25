/**
 * Extracts key-value pairs from the provided `settings` worksheet and writes them to a JSON file.
 *
 * The function reads the worksheet, converts it to JSON, and processes each row to extract
 * settings. If the key is "last_updated", it formats the date from Excel's serial date format
 * to "yyyy-mm-dd". The extracted settings are merged with default values and saved to
 * "src/assets/settings.json".
 *
 * @param {Object} worksheet - The worksheet object from which to extract settings.
 * @returns {Object} The merged settings object containing both defaults and extracted values.
 */
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

const defaults = {
    start_quarter: 1,
    start_year: 2020,
    end_quarter: 4,
    end_year: 2023,
    last_updated: new Date().toISOString().split("T")[0],
};

/**
 * Extract key-value pairs from the `settings` worksheet.
 */
module.exports = function (worksheet) {
    const settings = {};
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    jsonData.forEach((row) => {
        const key = row["key"];
        const value = row["value"];
        if (key === "last_updated" && value) {
            // Date values need to be adjusted from Excel serial date format.
            settings[key] = XLSX.SSF.format("yyyy-mm-dd", value);
        } else if (key && value) {
            settings[key] = value;
        }
    });

    fs.writeFileSync(
        path.join(
            __dirname,
            "..",
            "src",
            "assets",
            "payloads",
            "settings.json",
        ),
        JSON.stringify(settings, null, 2),
    );

    return { ...defaults, ...settings };
};
