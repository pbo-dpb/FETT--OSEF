const crypto = require('crypto');
const fs = require('fs')
const path = require('path')
const XLSX = require('xlsx')


const idForDepartmentName = function (nameEn) {
    return crypto.createHash('md5').update(nameEn).digest('hex');
}

/**
 * Create a departments object from the `departments` worksheet.
 * The `departments` worksheet is expected to have columns: 
 * "dept_en", "dept_fr", "acronym_en", "acronym_fr".
 */
const importDepartments = function (worksheet) {
    const departments = {}
    const jsonData = XLSX.utils.sheet_to_json(worksheet)
    jsonData.forEach(row => {
        const nameEn = row['dept_en']
        const nameFr = row['dept_fr']
        const acronymEn = row['acronym_en']
        const acronymFr = row['acronym_fr']

        if (!nameEn || !nameFr) {
            console.error('Department entry is missing required dept_en or dept_fr:', row);
            return;
        }

        const id = idForDepartmentName(nameEn);

        if (nameEn && nameFr) {
            departments[id] = {
                id: id,
                name_en: nameEn,
                name_fr: nameFr,
                acronym_en: acronymEn || null,
                acronym_fr: acronymFr || null
            }
        }

    })
    return departments;
}

/**
 * This function create a file for each department in the departments object.
 * Each file is named with the given department id (md5 hash of its
 * English name), and can be fetched independently if required by
 * the tool for performance optimization purposes.
 */
const saveDepartments = function (departments, aggregator) {

    // Save each department as a separate JSON file, overwriting existing files.
    const deptOutputDir = path.join(__dirname, "..", 'src', 'assets', 'departments')
    if (!fs.existsSync(deptOutputDir)) {
        fs.mkdirSync(deptOutputDir, { recursive: true })
    }

    Object.values(departments).forEach(dept => {
        const deptDetails = {};

        deptDetails.total_ftes_per_quarter = aggregator.totalFtesPerQuarterForDepartment(dept.id);
        deptDetails.total_ftes_per_fiscal_year = aggregator.totalFtesPerFiscalYear(dept.id);

        const outputFilePath = path.join(deptOutputDir, `${dept.id}.json`)
        fs.writeFileSync(outputFilePath, JSON.stringify(deptDetails), 'utf8')
    })

}


module.exports = {
    idForDepartmentName,
    saveDepartments,
    importDepartments
}