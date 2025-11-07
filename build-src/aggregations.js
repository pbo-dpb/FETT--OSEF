module.exports = class Aggregator {

    paddedMonthlyTotals = null;
    constructor(settings, datapoints) {
        this.settings = settings;
        this.datapoints = datapoints;

        this.preparePaddedMonthlyTotals();
        this.preparedPaddedMonthlyDepartmentTotals();
    }

    preparedPaddedMonthlyDepartmentTotals = function () {

        this.paddedMonthlyDepartmentTotals = {};


        this.datapoints.map(dp => dp.department_id).filter((value, index, self) => self.indexOf(value) === index).forEach(department_id => {
            this.paddedMonthlyDepartmentTotals[department_id] = [];

            this.loopFunctionOverPeriod({
                ...this.settings,
                start_year: this.settings.start_year - 1,
                start_quarter: 1,
                end_year: this.settings.end_year + 1,
                end_quarter: 4
            }, 'month', (year, month) => {

                const previousMonthForDept = this.paddedMonthlyDepartmentTotals[department_id].length > 0 ? this.paddedMonthlyDepartmentTotals[department_id][this.paddedMonthlyDepartmentTotals[department_id].length - 1] : null;

                const monthEntry = {
                    year: year,
                    month: month,
                    unreported: true,
                    shouldFillWithZeros: false
                };
                ["unknown",
                    "indeterminate",
                    "term",
                    "casual",
                    "student",
                    "combined"].forEach(tenureType => {

                        let dataPointsForMonthDeptTenure = this.datapoints.filter(dp => dp.year === year && dp.month === month && dp.department_id === department_id && dp.tenure === tenureType);
                        if (dataPointsForMonthDeptTenure.length === 0) {
                            if (previousMonthForDept && previousMonthForDept.shouldFillWithZeros) {
                                monthEntry[tenureType] = 0;
                            } else if (previousMonthForDept) {
                                monthEntry[tenureType] = previousMonthForDept[tenureType] || 0;
                            }
                        } else {
                            // If we have one data point, mark this month as reported
                            monthEntry["unreported"] = false;
                            monthEntry[tenureType] = dataPointsForMonthDeptTenure.map((val) => val.fte).reduce((a, b) => a + b, 0);

                            // When we find a datapoint, we can check its source to see if we need to fill future missing months with zeros
                            if (dataPointsForMonthDeptTenure.find(dp => dp.source === 'data-main')) {
                                monthEntry.shouldFillWithZeros = true;
                            }
                        }
                    });

                this.paddedMonthlyDepartmentTotals[department_id].push(monthEntry);
            });

            this.paddedMonthlyDepartmentTotals[department_id] = this.paddedMonthlyDepartmentTotals[department_id].map(dp => {
                // Clean up by removing the helper property
                const { shouldFillWithZeros, ...rest } = dp;
                return rest;
            })

        })


    }

    preparePaddedMonthlyTotals = function () {

        // TODO This function should be refactored to remove duplication with the per-department version (newer and cleaner)

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
    }

    getPaddedMonthlyTotals = function () {
        return this.paddedMonthlyTotals;
    }

    trimTotalsToBounds(periodSettings, totals) {
        return totals.filter(dp => {
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


    trimmedPaddedMonthlyTotalsToPeriod = function (periodSettings) {
        return this.trimTotalsToBounds(periodSettings, this.getPaddedMonthlyTotals())
    }

    trimmedPaddedMonthlyDepartmentTotalsToPeriod = function (periodSettings, department_id) {
        return this.trimTotalsToBounds(periodSettings, this.paddedMonthlyDepartmentTotals[department_id]);
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

    totalFtesPerFiscalYear = function () {

        let monthlyTotals = this.trimmedPaddedMonthlyTotalsToPeriod(this.settings);

        let fiscalYearCursor = this.settings.start_year;
        let fiscalYears = [];
        while (fiscalYearCursor <= this.settings.end_year + (this.settings.end_quarter > 1 ? 1 : 0)) {

            let datapointsForYear = monthlyTotals.filter(mt => {
                let fiscalYearForMonth = mt.month >= 4 ? mt.year + 1 : mt.year;
                return fiscalYearForMonth === fiscalYearCursor;
            });

            let totals = {};
            Object.keys(monthlyTotals[0]).forEach(tenureType => {
                if (tenureType === 'year' || tenureType === 'month') {
                    return;
                }

                if (datapointsForYear.length === 0) {
                    totals[tenureType] = 0; // Avoid division by zero
                    return;
                }

                totals[tenureType] = datapointsForYear.map((val) => val[tenureType] || 0).reduce((a, b) => a + b, 0) / datapointsForYear.length;
            })

            fiscalYears.push({
                year: fiscalYearCursor,
                ...totals
            });

            fiscalYearCursor++;
        }

        return fiscalYears;
    }

    transformMonthlyTotalsToQuarterlyTotals = function (settings, monthlyTotals) {
        return this.loopFunctionOverPeriod(settings, 'quarter', (year, quarter) => {

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

            Object.keys(monthlyTotals.find(x => !x.unreported)).forEach(tenureType => {

                if (tenureType === 'year' || tenureType === 'month' || tenureType === 'unreported') {
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
     * A sum of all FTEs for each quarter across all departments. Will break down by tenure type and
     * order the results by year and quarter.
     * [{'year': '2020', 'quarter':1, 'indeterminate': 1, 'term':2, 'casual':3, 'student':4, 'combined':10}, ...]
     */
    totalFtesPerQuarter = function () {

        let monthlyTotals = this.trimmedPaddedMonthlyTotalsToPeriod({
            ...this.settings,
            // We need to pad the period to prevent the month filter to cut off data needed for quarterly calculations
            start_quarter: 1,
            start_year: this.settings.start_year - 1,
            end_quarter: 4,
            end_year: this.settings.end_year + 1
        });

        return this.transformMonthlyTotalsToQuarterlyTotals(this.settings, monthlyTotals);

    }


    /**
     * A sum of all FTEs for each month across all departments. Will break down by tenure type and
     * order the results by year and month.
     * [{'year': '2020', 'month':1, 'indeterminate': 1, 'term':2, 'casual':3, 'student':4, 'combined':10}, ...]
     */
    totalFtesPerMonth = function () {
        return this.trimmedPaddedMonthlyTotalsToPeriod(this.settings);
    }


    latestTotalFtesForDepartment = function (department_id) {
        const reports = this.paddedMonthlyDepartmentTotals[department_id].filter(monthEntry => monthEntry.unreported === false);
        let latestReport = reports.length > 0 ? reports[reports.length - 1] : null;

        // Clean up the "unreported" field before returning
        if (latestReport) {
            const { unreported, ...rest } = latestReport;
            return rest;
        } else {
            return null;
        }

    }


    totalFtesPerQuarterForDepartment = function (department_id) {

        let monthlyTotals = this.trimmedPaddedMonthlyDepartmentTotalsToPeriod({
            ...this.settings,
            // We need to pad the period to prevent the month filter to cut off data needed for quarterly calculations
            start_quarter: 1,
            start_year: this.settings.start_year - 1,
            end_quarter: 4,
            end_year: this.settings.end_year + 1
        }, department_id);

        return this.transformMonthlyTotalsToQuarterlyTotals(this.settings, monthlyTotals);

    }

    totalFtesPerMonthForDepartment = function (department_id) {
        return this.trimmedPaddedMonthlyDepartmentTotalsToPeriod(this.settings, department_id);
    }

}

