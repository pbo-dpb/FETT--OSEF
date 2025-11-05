/**
 * This script will take an input .xlsx file and convert it to a JSON payload.
 * The JSON payload will overwrite the existing payload files in the assets
 * directory. The script is intended to be run in development or during
 * a build process.
 * 
 * To run this script, use the following command:
 * `node build.js <input-file.xlsx>`
 * 
 * NPM must have been install prior to running this script.
 * 
 */

const XLSX = require('xlsx')
const fs = require('fs')
const path = require('path')

const handleStringsIo = require('./build-src/strings');
const handleSettingsIo = require('./build-src/settings');
const { importDepartments, saveDepartments } = require('./build-src/department');
const importDataSheet = require('./build-src/datasheets');
const { totalFtesPerMonth, totalFtesPerQuarter } = require('./build-src/aggregations');



// Get the input .xlsx file from command line arguments
const inputFile = process.argv[2]
if (!inputFile) {
    console.error('Please provide an input .xlsx file.')
    process.exit(1)
}


const workbook = XLSX.readFile(inputFile)

const stringsWorksheet = workbook.Sheets['strings']
if (!stringsWorksheet) {
    console.error('The input .xlsx file is missing the required "strings" sheet.')
    process.exit(1)
}
handleStringsIo(stringsWorksheet)

const settingsWorksheet = workbook.Sheets['settings']
if (!settingsWorksheet) {
    console.error('The input .xlsx file is missing the required "settings" sheet.')
    process.exit(1)
}
const settings = handleSettingsIo(settingsWorksheet)

const departmentsWorksheet = workbook.Sheets['departments']
if (!departmentsWorksheet) {
    console.error('The input .xlsx file is missing the required "departments" sheet.')
    process.exit(1)
}
const departments = importDepartments(departmentsWorksheet)

// Loop through all sheets to find data sheets
let datapoints = [];
workbook.SheetNames.forEach(sheetName => {
    const worksheet = workbook.Sheets[sheetName]
    if (sheetName.toLowerCase().startsWith('data-')) {
        datapoints = [
            ...datapoints,
            ...importDataSheet(sheetName, worksheet, departments)
        ];
        return;
    }
})


/***
 * EXPORT TO JSON FILES
 */

saveDepartments(departments, datapoints);

/**
 * Saves the datapoints that will be used to display the charts that
 * appear on the first page of the tool. The core payload also includes a list
 * of all supported departments and IDs so we can load their respective data
 * if needed.
 */
(function () {

    const payloads = {
        departments: Object.values(departments).map(dept => {
            return {
                id: dept.id,
                name_en: dept.name_en,
                name_fr: dept.name_fr
            }
        }),
        aggregations: {
            total_ftes_per_quarter: totalFtesPerQuarter(settings, datapoints),
            total_ftes_per_month: totalFtesPerMonth(settings, datapoints)
        }
    }

    Object.keys(payloads).forEach(key => {
        const outputFilePath = path.join(__dirname, 'src', 'assets', `${key}.json`)
        fs.writeFileSync(outputFilePath, JSON.stringify(payloads[key]), 'utf8')

    })

})()


console.log('Payload generation completed.')

