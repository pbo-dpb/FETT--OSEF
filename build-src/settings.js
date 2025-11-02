const XLSX = require('xlsx')

const defaults = {
    start_quarter: 1,
    start_year: 2020,
    end_quarter: 4,
    end_year: 2023,
    last_updated: (new Date()).toISOString().split('T')[0],
}

/**
 * Extract key-value pairs from the `settings` worksheet.
 */
module.exports = function (worksheet) {
    const settings = {}
    const jsonData = XLSX.utils.sheet_to_json(worksheet)

    jsonData.forEach(row => {
        const key = row['key']
        const value = row['value']
        if (key && value) {
            settings[key] = value
        }
    })

    return { ...defaults, ...settings }
}
