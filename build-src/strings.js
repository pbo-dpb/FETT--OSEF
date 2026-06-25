const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

/**
 * Will merge localization strings from the worksheet into existing JSON files.
 * Expects a worksheet with three columns: "key", "en", "fr".
 */
module.exports = function (worksheet) {
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    const languages = ["en", "fr"];

    languages.forEach((lang) => {
        const outputFilePath = path.join(
            __dirname,
            "..",
            "src",
            "assets",
            "strings",
            `${lang}.json`,
        );

        let existingStrings = {};
        if (fs.existsSync(outputFilePath)) {
            const rawData = fs.readFileSync(outputFilePath, "utf8");
            existingStrings = JSON.parse(rawData);
        }

        // Note: This will overwrite existing keys with new values from the spreadsheet.
        jsonData.forEach((row) => {
            const key = row["key"];
            const value = row[lang];
            if (key && value) {
                existingStrings[key] = value;
            }
        });

        fs.writeFileSync(
            outputFilePath,
            JSON.stringify(existingStrings, null, 4),
            "utf8",
        );
    });
};
