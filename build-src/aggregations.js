function loopFunctionOverPeriod(settings, runnable) {

    const output = [];

    let cursor = {
        year: parseInt(settings.start_year),
        quarter: parseInt(settings.start_quarter)
    }

    while ((cursor.year < parseInt(settings.end_year)) ||
        (cursor.year === parseInt(settings.end_year) && cursor.quarter <= parseInt(settings.end_quarter))) {

        output.push(runnable(cursor.year, cursor.quarter));

        if (cursor.quarter === 4) {
            cursor.year++;
            cursor.quarter = 1;
        } else {
            cursor.quarter++;
        }
    }

    return output;

}


/**
 * A sum of all FTEs for each quarter across all departments. Will break down by tenure type and
 * order the results by year and quarter.
 * [{'year': '2020', 'quarter':1, 'indeterminate': 1, 'term':2, 'casual':3, 'student':4, 'combined':10}, ...]
 */
function totalFtesPerQuarter(settings, datapoints) {

    return loopFunctionOverPeriod(settings, (year, quarter) => {

        const total = {
            unknown: datapoints.filter(dp => dp.year === year && dp.quarter === quarter).reduce((sum, dp) => sum + (dp.tenure === 'unknown' ? dp.fte : 0), 0),
            indeterminate: datapoints.filter(dp => dp.year === year && dp.quarter === quarter).reduce((sum, dp) => sum + (dp.tenure === 'indeterminate' ? dp.fte : 0), 0),
            term: datapoints.filter(dp => dp.year === year && dp.quarter === quarter).reduce((sum, dp) => sum + (dp.tenure === 'term' ? dp.fte : 0), 0),
            casual: datapoints.filter(dp => dp.year === year && dp.quarter === quarter).reduce((sum, dp) => sum + (dp.tenure === 'casual' ? dp.fte : 0), 0),
            student: datapoints.filter(dp => dp.year === year && dp.quarter === quarter).reduce((sum, dp) => sum + (dp.tenure === 'student' ? dp.fte : 0), 0),
            combined: datapoints.filter(dp => dp.year === year && dp.quarter === quarter).reduce((sum, dp) => sum + (dp.tenure === 'combined' ? dp.fte : 0), 0),
        };


        const firstReportingMonthInPeriod = datapoints
            .filter(dp => dp.year === year && dp.quarter === quarter)
            .map(dp => dp.month)
            .sort((a, b) => a - b)[0];

        const lastReportingMonthInPeriod = datapoints
            .filter(dp => dp.year === year && dp.quarter === quarter)
            .map(dp => dp.month)
            .sort((a, b) => b - a)[0];

        const reportingForNMonths = lastReportingMonthInPeriod - firstReportingMonthInPeriod + 1;

        if (reportingForNMonths === 0) {
            return total; // No data for this period; avoid division by zero
        }

        return {
            year: year,
            quarter: quarter,
            unknown: Math.round(total.unknown / reportingForNMonths),
            indeterminate: Math.round(total.indeterminate / reportingForNMonths),
            term: Math.round(total.term / reportingForNMonths),
            casual: Math.round(total.casual / reportingForNMonths),
            student: Math.round(total.student / reportingForNMonths),
            combined: Math.round(total.combined / reportingForNMonths),
        };

    });

}


module.exports = {
    totalFtesPerQuarter
}