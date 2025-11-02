/**
 * This script will take an input .xlsx file and convert it to a JSON payload.
 * The JSON payload will overwrite the existing payload files in the assets
 * directory. The script is intended to be run in development or during
 * a build process.
 * 
 * To run this script, use the following command:
 * `node buildpayload.js <input-file.xlsx>`
 * 
 * NPM must have been install prior to running this script.
 * 
 */

const XLSX = require('xlsx')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto');



const inputFile = process.argv[2]
if (!inputFile) {
    console.error('Please provide an input .xlsx file.')
    process.exit(1)
}

/**
 * GLOBAL VARIABLES
 */

let departments = {}
let datapoints = []


/**
 * Will merge localization strings from the worksheet into existing JSON files.
 * Expects a worksheet with three columns: "key", "en", "fr".
 */
const handleStringsIo = function (worksheet) {
    const jsonData = XLSX.utils.sheet_to_json(worksheet)
    const languages = ['en', 'fr']

    languages.forEach(lang => {
        const outputFilePath = path.join(__dirname, 'src', 'assets', 'strings', `${lang}.json`)

        let existingStrings = {}
        if (fs.existsSync(outputFilePath)) {
            const rawData = fs.readFileSync(outputFilePath, 'utf8')
            existingStrings = JSON.parse(rawData)
        }

        // Note: This will overwrite existing keys with new values from the spreadsheet.
        jsonData.forEach(row => {
            const key = row['key']
            const value = row[lang]
            if (key && value) {
                existingStrings[key] = value
            }
        })

        fs.writeFileSync(outputFilePath, JSON.stringify(existingStrings), 'utf8')
    })
}


/**
 * Import data from a given `data-*` worksheet. Will append encountered datapoints
 * to the departments' data in the `departments` object.
 */
const importDataSheet = function (worksheet) {

    // TODO implement

}

const idForDepartmentName = function (nameEn) {
    return crypto.createHash('md5').update(nameEn).digest('hex');
}

/**
 * Create a departments object from the `departments` worksheet.
 * The `departments` worksheet is expected to have columns: 
 * "dept_en", "dept_fr", "acronym_en", "acronym_fr".
 */
const importDepartments = function (worksheet) {

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
}


/**
 * This function create a file for each department in the departments object.
 * Each file is named with the given department id (md5 hash of its
 * English name), and can be fetched independently if required by
 * the tool for performance optimization purposes.
 */
const saveDepartments = function () {

    // Save each department as a separate JSON file, overwriting existing files.
    const deptOutputDir = path.join(__dirname, 'src', 'assets', 'departments')
    if (!fs.existsSync(deptOutputDir)) {
        fs.mkdirSync(deptOutputDir, { recursive: true })
    }

    Object.values(departments).forEach(dept => {
        const outputFilePath = path.join(deptOutputDir, `${dept.id}.json`)
        fs.writeFileSync(outputFilePath, JSON.stringify(dept), 'utf8')
    })

}

/**
 * This function saves the datapoints that will be used to display the charts that
 * appear on the first page of the tool. The core payload also includes a list
 * of all supported departments and IDs so we can load their respective data
 * if needed.
 */
const saveCorePayload = function () {

    const payload = {
        departments: Object.values(departments).map(dept => {
            return {
                id: dept.id,
                name_en: dept.name_en,
                name_fr: dept.name_fr
            }
        }),
    }

    const outputFilePath = path.join(__dirname, 'src', 'assets', 'payload.json')
    fs.writeFileSync(outputFilePath, JSON.stringify(payload), 'utf8')
}


/***
 * IMPORT
 */
const workbook = XLSX.readFile(inputFile)

workbook.SheetNames.forEach(sheetName => {
    const worksheet = workbook.Sheets[sheetName]

    if (sheetName.toLowerCase() === 'strings') {
        handleStringsIo(worksheet)
        return
    }

    if (sheetName.toLowerCase() === 'departments') {

        importDepartments(worksheet)
    }

    if (sheetName.toLowerCase().startsWith('data-')) {
        importDataSheet(worksheet);
        return;
    }
})

/***
 * EXPORT
 */

saveDepartments();
saveCorePayload();

console.log('Payload generation completed.')

