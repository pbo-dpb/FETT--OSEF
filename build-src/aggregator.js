module.exports = class Aggregator {
    paddedMonthlyTotals = null;
    constructor(settings, datapoints) {
        this.settings = settings;
        this.datapoints = datapoints;

        this.preparePaddedMonthlyTotals();
        this.preparedPaddedMonthlyDepartmentTotals();

        this._totalFtesPerQuarter = null;
        this._totalPopsPerQuarter = null;
    }

    isMetaKey = function (key) {
        return ["year", "month", "quarter", "fy", "unreported"].includes(key);
    };

    isMetricKey = function (key, metric = "fte") {
        if (this.isMetaKey(key)) {
            return false;
        }

        if (metric === "pop") {
            return key.startsWith("pop_");
        }

        return !key.startsWith("pop_");
    };

    normalizeMetricKey = function (key, metric = "fte") {
        if (metric === "pop") {
            return key.replace(/^pop_/, "");
        }

        return key;
    };

    normalizeMetricRow = function (row, metric = "fte") {
        if (!row) {
            return null;
        }

        const normalized = {};
        Object.keys(row).forEach((key) => {
            if (this.isMetaKey(key)) {
                normalized[key] = row[key];
                return;
            }

            if (this.isMetricKey(key, metric)) {
                normalized[this.normalizeMetricKey(key, metric)] = row[key];
            }
        });

        return normalized;
    };

    normalizeMetricRows = function (rows, metric = "fte") {
        return rows.map((row) => this.normalizeMetricRow(row, metric));
    };

    metricTenureInputKeys = function (metric = "fte") {
        const baseTenures = [
            "unknown",
            "indeterminate",
            "term",
            "casual",
            "student",
            "combined",
        ];
        return metric === "pop"
            ? baseTenures.map((tenure) => `pop_${tenure}`)
            : baseTenures;
    };

    preparedPaddedMonthlyDepartmentTotals = function () {
        this.paddedMonthlyDepartmentTotals = {};

        this.datapoints
            .map((dp) => dp.department_id)
            .filter((value, index, self) => self.indexOf(value) === index)
            .forEach((department_id) => {
                this.paddedMonthlyDepartmentTotals[department_id] = [];

                this.loopFunctionOverPeriod(
                    {
                        ...this.settings,
                        start_year: this.settings.start_year - 1,
                        start_quarter: 1,
                        end_year: this.settings.end_year + 1,
                        end_quarter: 4,
                    },
                    "month",
                    (year, month) => {
                        const previousMonthForDept =
                            this.paddedMonthlyDepartmentTotals[department_id]
                                .length > 0
                                ? this.paddedMonthlyDepartmentTotals[
                                      department_id
                                  ][
                                      this.paddedMonthlyDepartmentTotals[
                                          department_id
                                      ].length - 1
                                  ]
                                : null;

                        const monthEntry = {
                            year: year,
                            month: month,
                            unreported: true,
                            shouldFillWithZeros: false,
                        };
                        [
                            "unknown",
                            "indeterminate",
                            "term",
                            "casual",
                            "student",
                            "combined",
                        ].forEach((tenureType) => {
                            const popTenureType = `pop_${tenureType}`;
                            let dataPointsForMonthDeptTenure =
                                this.datapoints.filter(
                                    (dp) =>
                                        dp.year === year &&
                                        dp.month === month &&
                                        dp.department_id === department_id &&
                                        dp.tenure === tenureType,
                                );
                            if (dataPointsForMonthDeptTenure.length === 0) {
                                if (
                                    previousMonthForDept &&
                                    previousMonthForDept.shouldFillWithZeros
                                ) {
                                    monthEntry[tenureType] = 0;
                                    monthEntry[popTenureType] = 0;
                                } else if (previousMonthForDept) {
                                    monthEntry[tenureType] =
                                        previousMonthForDept[tenureType] || 0;
                                    monthEntry[popTenureType] =
                                        previousMonthForDept[popTenureType] ||
                                        0;
                                }
                            } else {
                                // If we have one data point, mark this month as reported
                                monthEntry["unreported"] = false;
                                monthEntry[tenureType] =
                                    dataPointsForMonthDeptTenure
                                        .map((val) => val.fte)
                                        .reduce((a, b) => a + b, 0);
                                monthEntry[popTenureType] =
                                    dataPointsForMonthDeptTenure
                                        .map((val) => val.pop || 0)
                                        .reduce((a, b) => a + b, 0);

                                // When we find a datapoint, we can check its source to see if we need to fill future missing months with zeros
                                if (
                                    dataPointsForMonthDeptTenure.find(
                                        (dp) => dp.source === "data-main",
                                    )
                                ) {
                                    monthEntry.shouldFillWithZeros = true;
                                }
                            }
                        });

                        this.paddedMonthlyDepartmentTotals[department_id].push(
                            monthEntry,
                        );
                    },
                );

                this.paddedMonthlyDepartmentTotals[department_id] =
                    this.paddedMonthlyDepartmentTotals[department_id].map(
                        (dp) => {
                            // Clean up by removing the helper property
                            const { shouldFillWithZeros, ...rest } = dp;
                            return rest;
                        },
                    );
            });
    };

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
        };

        // We need to cheat on the period to avoid missing data points not being reported for months
        this.paddedMonthlyTotals = this.loopFunctionOverPeriod(
            {
                ...this.settings,
                start_year: this.settings.start_year - 1,
                start_quarter: 1,
                end_year: this.settings.end_year + 1,
                end_quarter: 4,
            },
            "month",
            (year, month) => {
                const totalsPerTenurePerDepartment = {};
                Object.keys(priorMonthTotals).forEach((tenureType) => {
                    totalsPerTenurePerDepartment[tenureType] = this.datapoints
                        .filter((dp) => dp.year === year && dp.month === month)
                        .filter((dp) => dp.tenure === tenureType);
                });

                const totals = {};

                Object.keys(totalsPerTenurePerDepartment).forEach(
                    (tenureType) => {
                        if (totals[tenureType] === undefined) {
                            totals[tenureType] = {};
                        }
                        const departmentRows =
                            totalsPerTenurePerDepartment[tenureType];

                        // Sum up totals per department, carrying forward prior month totals for unreported departments
                        departmentRows.forEach((row) => {
                            totals[tenureType][row.department_id] = {
                                fte: row.fte,
                                pop: row.pop,
                                source_of_dept: row.source,
                            };
                        });

                        // Carry forward prior month totals for unreported departments
                        Object.keys(priorMonthTotals[tenureType]).forEach(
                            (department_id) => {
                                if (
                                    totals[tenureType][department_id] ===
                                    undefined
                                ) {
                                    totals[tenureType][department_id] =
                                        priorMonthTotals[tenureType][
                                            department_id
                                        ];

                                    // When importing from data-main, we will set skipped month-tenure-dept combinations to zero. This will not be true for other sheets, as they may report sporadically.
                                    if (
                                        totals[tenureType][department_id]
                                            .source_of_dept === "data-main"
                                    ) {
                                        totals[tenureType][department_id].fte =
                                            0;
                                        totals[tenureType][department_id].pop =
                                            0;
                                    }
                                }
                            },
                        );

                        priorMonthTotals[tenureType] = totals[tenureType];
                    },
                );

                const result = {
                    year: year,
                    month: month,
                };

                Object.keys(totals).forEach((tenureType) => {
                    result[tenureType] = Object.values(
                        totals[tenureType],
                    ).reduce((sum, val) => sum + val.fte, 0);
                    result[`pop_${tenureType}`] = Object.values(
                        totals[tenureType],
                    ).reduce((sum, val) => sum + (val.pop || 0), 0);
                });

                return result;
            },
        ).filter((dp) => {
            // Make sure we only return datapoints within the original requested range
            if (dp.year < this.settings.start_year) {
                return false;
            }
            const quarterBottomMonth = { 1: 1, 2: 4, 3: 7, 4: 10 }[
                parseInt(this.settings.start_quarter)
            ];
            if (
                dp.year === this.settings.start_year &&
                dp.month < quarterBottomMonth
            ) {
                return false;
            }
            return true;
        });
    };

    getPaddedMonthlyTotals = function () {
        return this.paddedMonthlyTotals;
    };

    trimTotalsToBounds(periodSettings, totals) {
        return totals.filter((dp) => {
            // Make sure we only return datapoints within the original requested range
            if (dp.year < periodSettings.start_year) {
                return false;
            }
            const quarterBottomMonth = { 1: 1, 2: 4, 3: 7, 4: 10 }[
                parseInt(periodSettings.start_quarter)
            ];
            if (
                dp.year === periodSettings.start_year &&
                dp.month < quarterBottomMonth
            ) {
                return false;
            }
            if (dp.year > periodSettings.end_year) {
                return false;
            }
            const quarterTopMonth = { 1: 3, 2: 6, 3: 9, 4: 12 }[
                parseInt(periodSettings.end_quarter)
            ];
            if (
                dp.year === periodSettings.end_year &&
                dp.month > quarterTopMonth
            ) {
                return false;
            }
            return true;
        });
    }

    trimmedPaddedMonthlyTotalsToPeriod = function (periodSettings) {
        return this.trimTotalsToBounds(
            periodSettings,
            this.getPaddedMonthlyTotals(),
        );
    };

    monthlyDepartmentTotalsToPeriod = function (department_id) {
        return this.paddedMonthlyDepartmentTotals[department_id] || [];
    };

    loopFunctionOverPeriod = function (settings, period, runnable) {
        const output = [];

        let cursor = {
            year: parseInt(settings.start_year),
        };

        if (period === "quarter") {
            cursor.quarter = parseInt(settings.start_quarter);
        } else if (period === "month") {
            cursor.month = { 1: 1, 2: 4, 3: 7, 4: 10 }[
                parseInt(settings.start_quarter)
            ];
        }

        while (
            cursor.year < parseInt(settings.end_year) ||
            (cursor.year === parseInt(settings.end_year) &&
                (period === "quarter"
                    ? cursor.quarter <= parseInt(settings.end_quarter)
                    : cursor.month <=
                      { 1: 3, 2: 6, 3: 9, 4: 12 }[
                          parseInt(settings.start_quarter)
                      ]))
        ) {
            if (period === "quarter") {
                output.push(runnable(cursor.year, cursor.quarter));

                if (cursor.quarter === 4) {
                    cursor.year++;
                    cursor.quarter = 1;
                } else {
                    cursor.quarter++;
                }
            } else if (period === "month") {
                output.push(runnable(cursor.year, cursor.month));

                if (cursor.month === 12) {
                    cursor.year++;
                    cursor.month = 1;
                } else {
                    cursor.month++;
                }
            }
        }
        return output;
    };

    totalPerFiscalYear = function (metric = "fte", department_id = null) {
        let monthlyTotals;
        if (department_id) {
            monthlyTotals = this.monthlyDepartmentTotalsToPeriod(department_id);
        } else {
            monthlyTotals = this.trimmedPaddedMonthlyTotalsToPeriod(
                this.settings,
            );
        }
        monthlyTotals = monthlyTotals || [];

        let fiscalYearCursor = this.settings.start_year;
        let fiscalYears = [];
        while (
            fiscalYearCursor <=
            this.settings.end_year - (this.settings.end_quarter == 1 ? 1 : 0)
        ) {
            let datapointsForYear = monthlyTotals
                .filter((mt) => {
                    let fiscalYearForMonth =
                        mt.month < 4 ? mt.year + 1 : mt.year;
                    return fiscalYearForMonth === fiscalYearCursor;
                })
                .filter((mt) => {
                    // Eliminate dp that contain only 0s.
                    let hasNonZero = false;
                    Object.keys(mt).forEach((key) => {
                        if (
                            key !== "year" &&
                            key !== "month" &&
                            key !== "unreported" &&
                            mt[key] > 0
                        ) {
                            hasNonZero = true;
                        }
                    });
                    return hasNonZero;
                });

            let totals = {};
            // Some objects may not have tenure types; fall back to known keys when none are present.
            const sampleMonthlyRow = monthlyTotals.find((x) =>
                Object.keys(x).some((key) => this.isMetricKey(key, metric)),
            );
            const tenureTypes = sampleMonthlyRow
                ? Object.keys(sampleMonthlyRow).filter((key) =>
                      this.isMetricKey(key, metric),
                  )
                : this.metricTenureInputKeys(metric);

            tenureTypes.forEach((tenureType) => {
                const outputKey = this.normalizeMetricKey(tenureType, metric);

                if (datapointsForYear.length === 0) {
                    totals[outputKey] = 0; // Avoid division by zero
                    return;
                }

                totals[outputKey] =
                    datapointsForYear
                        .map((val) => val[tenureType] || 0)
                        .reduce((a, b) => a + b, 0) / datapointsForYear.length;
            });

            fiscalYears.push({
                year: fiscalYearCursor,
                ...totals,
            });

            fiscalYearCursor++;
        }

        return fiscalYears;
    };

    totalFtesPerFiscalYear = function (department_id = null) {
        return this.totalPerFiscalYear("fte", department_id);
    };

    totalPopsPerFiscalYear = function (department_id = null) {
        return this.totalPerFiscalYear("pop", department_id);
    };

    transformMonthlyTotalsToQuarterlyTotals = function (
        settings,
        monthlyTotals,
        metric = "fte",
    ) {
        monthlyTotals = monthlyTotals || [];

        return this.loopFunctionOverPeriod(
            settings,
            "quarter",
            (year, quarter) => {
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

                const sampleMonthlyRow = monthlyTotals.find((x) =>
                    Object.keys(x).some((key) => this.isMetricKey(key, metric)),
                );
                const tenureTypes = sampleMonthlyRow
                    ? Object.keys(sampleMonthlyRow).filter((key) =>
                          this.isMetricKey(key, metric),
                      )
                    : this.metricTenureInputKeys(metric);

                tenureTypes.forEach((tenureType) => {
                    const outputKey = this.normalizeMetricKey(
                        tenureType,
                        metric,
                    );

                    const monthlyTotalsForTenureArray = monthlyTotals
                        .filter(
                            (mt) =>
                                mt.year === year &&
                                quarterMonths.includes(mt.month),
                        )
                        .map((val) => val[tenureType] || 0);
                    if (monthlyTotalsForTenureArray.length) {
                        // Average over all months in the quarter
                        totals[outputKey] =
                            monthlyTotalsForTenureArray.reduce(
                                (a, b) => a + b,
                                0,
                            ) / monthlyTotalsForTenureArray.length;
                    } else {
                        totals[outputKey] = 0;
                    }
                });
                return totals;
            },
        );
    };

    /**
     * A sum of all FTEs for each quarter across all departments. Will break down by tenure type and
     * order the results by year and quarter.
     * [{'year': '2020', 'quarter':1, 'indeterminate': 1, 'term':2, 'casual':3, 'student':4, 'combined':10}, ...]
     */
    totalFtesPerQuarter = function () {
        if (this._totalFtesPerQuarter) {
            return this._totalFtesPerQuarter;
        }

        let monthlyTotals = this.trimmedPaddedMonthlyTotalsToPeriod({
            ...this.settings,
            // We need to pad the period to prevent the month filter to cut off data needed for quarterly calculations
            start_quarter: 1,
            start_year: this.settings.start_year - 1,
            end_quarter: 4,
            end_year: this.settings.end_year + 1,
        });

        this._totalFtesPerQuarter =
            this.transformMonthlyTotalsToQuarterlyTotals(
                this.settings,
                monthlyTotals,
                "fte",
            );
        return this._totalFtesPerQuarter;
    };

    totalPopsPerQuarter = function () {
        if (this._totalPopsPerQuarter) {
            return this._totalPopsPerQuarter;
        }

        let monthlyTotals = this.trimmedPaddedMonthlyTotalsToPeriod({
            ...this.settings,
            start_quarter: 1,
            start_year: this.settings.start_year - 1,
            end_quarter: 4,
            end_year: this.settings.end_year + 1,
        });

        this._totalPopsPerQuarter =
            this.transformMonthlyTotalsToQuarterlyTotals(
                this.settings,
                monthlyTotals,
                "pop",
            );
        return this._totalPopsPerQuarter;
    };

    /**
     * A sum of all FTEs for each month across all departments. Will break down by tenure type and
     * order the results by year and month.
     * [{'year': '2020', 'month':1, 'indeterminate': 1, 'term':2, 'casual':3, 'student':4, 'combined':10}, ...]
     */
    totalFtesPerMonth = function () {
        return this.normalizeMetricRows(
            this.trimmedPaddedMonthlyTotalsToPeriod(this.settings),
            "fte",
        );
    };

    totalPopsPerMonth = function () {
        return this.normalizeMetricRows(
            this.trimmedPaddedMonthlyTotalsToPeriod(this.settings),
            "pop",
        );
    };

    latestTotalFtesForDepartment = function (department_id) {
        const reports = (
            this.paddedMonthlyDepartmentTotals[department_id] || []
        ).filter((monthEntry) => monthEntry.unreported === false);
        let latestReport =
            reports.length > 0 ? reports[reports.length - 1] : null;

        // Clean up the "unreported" field before returning
        if (latestReport) {
            const { unreported, ...rest } = this.normalizeMetricRow(
                latestReport,
                "fte",
            );
            return rest;
        } else {
            return null;
        }
    };

    latestTotalPopsForDepartment = function (department_id) {
        const reports = (
            this.paddedMonthlyDepartmentTotals[department_id] || []
        ).filter((monthEntry) => monthEntry.unreported === false);
        let latestReport =
            reports.length > 0 ? reports[reports.length - 1] : null;

        if (latestReport) {
            const { unreported, ...rest } = this.normalizeMetricRow(
                latestReport,
                "pop",
            );
            return rest;
        } else {
            return null;
        }
    };

    totalFtesPerQuarterForDepartment = function (department_id) {
        let monthlyTotals = this.monthlyDepartmentTotalsToPeriod(department_id);

        return this.transformMonthlyTotalsToQuarterlyTotals(
            this.settings,
            monthlyTotals,
            "fte",
        );
    };

    totalPopsPerQuarterForDepartment = function (department_id) {
        let monthlyTotals = this.monthlyDepartmentTotalsToPeriod(department_id);

        return this.transformMonthlyTotalsToQuarterlyTotals(
            this.settings,
            monthlyTotals,
            "pop",
        );
    };

    totalFtesPerMonthForDepartment = function (department_id) {
        return this.normalizeMetricRows(
            this.monthlyDepartmentTotalsToPeriod(department_id),
            "fte",
        );
    };

    totalPopsPerMonthForDepartment = function (department_id) {
        return this.normalizeMetricRows(
            this.monthlyDepartmentTotalsToPeriod(department_id),
            "pop",
        );
    };
};
