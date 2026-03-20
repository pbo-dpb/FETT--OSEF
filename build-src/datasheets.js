const XLSX = require("xlsx");
const idForDepartmentName = require("./department").idForDepartmentName;

/**
 * Import data from a given `data-*` worksheet.
 */
module.exports = function (sheetName, worksheet, departments) {
    let datapoints = [];
    const rows = XLSX.utils.sheet_to_json(worksheet);
    const quarters = {
        1: 1,
        2: 1,
        3: 1,
        4: 2,
        5: 2,
        6: 2,
        7: 3,
        8: 3,
        9: 3,
        10: 4,
        11: 4,
        12: 4,
    };

    const tenures = {
        missing: "unknown",
        Indeterminate: "indeterminate",
        Term: "term",
        Casual: "casual",
        Student: "student",
        Total: "combined",
    };

    rows.forEach((row) => {
        const deptname = row["dept"];

        if (!deptname) {
            console.error("Data row is missing required dept name:", row);
            return;
        }

        const department_id = idForDepartmentName(deptname);

        if (!departments[department_id]) {
            console.error(
                `Data row references unknown department: ${deptname}`,
            );
            return;
        }

        const ym = row["file_date"];

        const year = parseInt(String(ym).substring(0, 4));
        const month = parseInt(String(ym).substring(4, 6).padStart(2, "0"));

        const fy = month >= 4 ? year + 1 : year;

        const tenure = tenures[row["tenure"]];

        if (!tenure) {
            console.error(
                "Data row has unknown tenure type:",
                row["tenure"],
                row,
            );
            return;
        }

        const adjustedRow = {
            department_id: department_id,
            year: year,
            month: month,
            quarter: quarters[parseInt(month)],
            fy: fy,
            tenure: tenure,
            pop: parseInt(row["Pop"]),
            fte: parseFloat(row["FTE"]),
            source: sheetName,
            //'assigned_h': row['assigned_h'], //TODO clarify with Marianne if needed
            //'normal_h': row['normal_h'],//TODO clarify with Marianne if needed
            //'fte_ratio': row['fte_ratio'],//TODO clarify with Marianne if needed
        };

        datapoints.push(adjustedRow);
    });
    return datapoints;
};
