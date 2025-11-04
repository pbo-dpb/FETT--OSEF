function loopFunctionOverPeriod(settings, period, runnable) {

    const output = [];

    let cursor = {
        year: parseInt(settings.start_year)
    }

    if (period === 'quarter') {
        cursor.quarter = parseInt(settings.start_quarter);
    } else if (period === 'month') {
        cursor.month = { 1: 1, 2: 4, 3: 7, 4: 10 }[parseInt(settings.start_quarter)];
    }


    while ((cursor.year < parseInt(settings.end_year)) ||
        (cursor.year === parseInt(settings.end_year) && (period === 'quarter' ? (cursor.quarter <= parseInt(settings.end_quarter)) : (cursor.month <= { 1: 3, 2: 6, 3: 9, 4: 12 }[parseInt(settings.start_quarter)])))) {

        if (period === 'quarter') {

            output.push(runnable(cursor.year, cursor.quarter));

            if (cursor.quarter === 4) {
                cursor.year++;
                cursor.quarter = 1;
            } else {
                cursor.quarter++;
            }
        } else if (period === 'month') {

            output.push(runnable(cursor.year, cursor.month));

            if (cursor.month === 12) {
                cursor.year++;
                cursor.month = 1;
            }
            else {
                cursor.month++;
            }


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

    return loopFunctionOverQuarter(settings, 'quarter', (year, quarter) => {

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


/**
 * A sum of all FTEs for each month across all departments. Will break down by tenure type and
 * order the results by year and month.
 * [{'year': '2020', 'month':1, 'indeterminate': 1, 'term':2, 'casual':3, 'student':4, 'combined':10}, ...]
 */
function totalFtesPerMonth(settings, datapoints) {

    // We keep track of the last month as to keep a rolling number for unreported/missing months
    let priorMonthTotals = {
        unknown: 0,
        indeterminate: 0,
        term: 0,
        casual: 0,
        student: 0,
        combined: 0,
    }

    return loopFunctionOverPeriod(settings, 'month', (year, month) => {

        const total = {
            unknown: datapoints.filter(dp => dp.year === year && dp.month === month).reduce((sum, dp) => sum + (dp.tenure === 'unknown' ? dp.fte : 0), 0) || priorMonthTotals.unknown,
            indeterminate: datapoints.filter(dp => dp.year === year && dp.month === month).reduce((sum, dp) => sum + (dp.tenure === 'indeterminate' ? dp.fte : 0), 0) || priorMonthTotals.indeterminate,
            term: datapoints.filter(dp => dp.year === year && dp.month === month).reduce((sum, dp) => sum + (dp.tenure === 'term' ? dp.fte : 0), 0) || priorMonthTotals.term,
            casual: datapoints.filter(dp => dp.year === year && dp.month === month).reduce((sum, dp) => sum + (dp.tenure === 'casual' ? dp.fte : 0), 0) || priorMonthTotals.casual,
            student: datapoints.filter(dp => dp.year === year && dp.month === month).reduce((sum, dp) => sum + (dp.tenure === 'student' ? dp.fte : 0), 0) || priorMonthTotals.student,
            combined: datapoints.filter(dp => dp.year === year && dp.month === month).reduce((sum, dp) => sum + (dp.tenure === 'combined' ? dp.fte : 0), 0) || priorMonthTotals.combined,
        };

        priorMonthTotals = total;

        return {
            year: year,
            month: month,
            ...total
        };

    });

}


module.exports = {
    totalFtesPerMonth
}