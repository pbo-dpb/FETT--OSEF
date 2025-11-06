module.exports = class Aggregator {

    paddedMonthlyTotals = null;
    constructor(settings, datapoints) {
        this.settings = settings;
        this.datapoints = datapoints;
    }



    getPaddedMonthlyTotals = function () {
        if (this.paddedMonthlyTotals !== null) {
            return this.paddedMonthlyTotals;
        }


        // We keep track of the last month as to keep a rolling number for unreported/missing months
        let priorMonthTotals = {
            unknown: {},
            indeterminate: {},
            term: {},
            casual: {},
            student: {},
            combined: {},
        }

        // We need to cheat on the period to avoid missing data points not being reported for months

        this.paddedMonthlyTotals = this.loopFunctionOverPeriod({
            ...this.settings,
            start_year: this.settings.start_year - 1,
            start_quarter: 1,
            end_year: this.settings.end_year + 1,
            end_quarter: 4
        }, 'month', (year, month) => {

            const totalsPerTenurePerDepartment = {};
            Object.keys(priorMonthTotals).forEach(tenureType => {
                totalsPerTenurePerDepartment[tenureType] = this.datapoints.filter(dp => dp.year === year && dp.month === month).filter(dp => dp.tenure === tenureType);
            });

            const totals = {};

            Object.keys(totalsPerTenurePerDepartment).forEach(tenureType => {
                if (totals[tenureType] === undefined) {
                    totals[tenureType] = {};
                }
                const departmentRows = totalsPerTenurePerDepartment[tenureType];

                // Sum up totals per department, carrying forward prior month totals for unreported departments
                departmentRows.forEach(row => {
                    totals[tenureType][row.department_id] = { fte: row.fte, source_of_dept: row.source };
                });

                // Carry forward prior month totals for unreported departments
                Object.keys(priorMonthTotals[tenureType]).forEach(department_id => {
                    if (totals[tenureType][department_id] === undefined) {
                        totals[tenureType][department_id] = priorMonthTotals[tenureType][department_id];

                        // When importing from data-main, we will set skipped month-tenure-dept combinations to zero. This will not be true for other sheets, as they may report sporadically.
                        if (totals[tenureType][department_id].source_of_dept === 'data-main') {
                            totals[tenureType][department_id].fte = 0;
                        }
                    }
                });

                priorMonthTotals[tenureType] = totals[tenureType];
            })

            const result = {
                year: year,
                month: month,
            };

            Object.keys(totals).forEach(tenureType => {
                result[tenureType] = Object.values(totals[tenureType]).reduce((sum, val) => sum + val.fte, 0);
            });

            return result;
        }).filter(dp => {
            // Make sure we only return datapoints within the original requested range
            if (dp.year < this.settings.start_year) {
                return false;
            }
            const quarterBottomMonth = { 1: 1, 2: 4, 3: 7, 4: 10 }[parseInt(this.settings.start_quarter)];
            if (dp.year === this.settings.start_year && dp.month < quarterBottomMonth) {
                return false;
            }
            return true;

        })
        return this.paddedMonthlyTotals;
    }

    trimmedPaddedMonthlyTotalsToPeriod = function (periodSettings) {

        return this.getPaddedMonthlyTotals().filter(dp => {
            // Make sure we only return datapoints within the original requested range
            if (dp.year < periodSettings.start_year) {
                return false;
            }
            const quarterBottomMonth = { 1: 1, 2: 4, 3: 7, 4: 10 }[parseInt(periodSettings.start_quarter)];
            if (dp.year === periodSettings.start_year && dp.month < quarterBottomMonth) {
                return false;
            }
            if (dp.year > periodSettings.end_year) {
                return false;
            }
            const quarterTopMonth = { 1: 3, 2: 6, 3: 9, 4: 12 }[parseInt(periodSettings.end_quarter)];
            if (dp.year === periodSettings.end_year && dp.month > quarterTopMonth) {
                return false;
            }
            return true;

        })
    }

    loopFunctionOverPeriod = function (settings, period, runnable) {

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

    totalFtesYearlyAverages = function (settings, datapoints) {

    }


    /**
     * A sum of all FTEs for each quarter across all departments. Will break down by tenure type and
     * order the results by year and quarter.
     * [{'year': '2020', 'quarter':1, 'indeterminate': 1, 'term':2, 'casual':3, 'student':4, 'combined':10}, ...]
     */
    totalFtesPerQuarter = function (settings, datapoints) {

        let monthlyTotals = this.trimmedPaddedMonthlyTotalsToPeriod({
            ...this.settings,
            // We need to pad the period to prevent the month filter to cut off data needed for quarterly calculations
            start_quarter: 1,
            start_year: this.settings.start_year - 1,
            end_quarter: 4,
            end_year: this.settings.end_year + 1
        });

        return this.loopFunctionOverPeriod(this.settings, 'quarter', (year, quarter) => {

            const quarterMonths = {
                1: [1, 2, 3],
                2: [4, 5, 6],
                3: [7, 8, 9],
                4: [10, 11, 12],
            }[quarter];

            const totals = {
                year: year,
                quarter: quarter,
            };

            Object.keys(monthlyTotals[0]).forEach(tenureType => {
                if (tenureType === 'year' || tenureType === 'month') {
                    return;
                }

                const monthlyTotalsForTenureArray = monthlyTotals.filter(mt => mt.year === year && quarterMonths.includes(mt.month)).map((val) => val[tenureType] || 0);
                if (monthlyTotalsForTenureArray.length) {
                    // Average over all months in the quarter
                    totals[tenureType] = monthlyTotalsForTenureArray.reduce((a, b) => a + b, 0) / monthlyTotalsForTenureArray.length;
                } else {
                    totals[tenureType] = 0;
                }
            })
            return totals;

        });

    }


    /**
     * A sum of all FTEs for each month across all departments. Will break down by tenure type and
     * order the results by year and month.
     * [{'year': '2020', 'month':1, 'indeterminate': 1, 'term':2, 'casual':3, 'student':4, 'combined':10}, ...]
     */
    totalFtesPerMonth = function () {
        return this.trimmedPaddedMonthlyTotalsToPeriod(this.settings);
    }

}



