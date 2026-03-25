module.exports = class Overviewer {
    constructor(aggregator, departments, departmentsDetails) {
        this.aggregator = aggregator;
        this.departments = departments;
        this.departmentsDetails = departmentsDetails;
    }

    sumRowsForDepartmentOrGlobalQuarterOrFiscalYear(
        row,
        includeCombined = true,
    ) {
        let total = 0;

        total +=
            (row.indeterminate || 0) +
            (row.term || 0) +
            (row.casual || 0) +
            (row.student || 0);
        if (includeCombined) {
            total += row.combined || 0;
        }
        return total;
    }

    diffDepartmentForQuarter(
        deptId,
        firstYear,
        firstQuarter,
        secondYear,
        secondQuarter,
        metric = "fte",
    ) {
        let departmentMeta = this.departments[deptId];
        let department = this.departmentsDetails[deptId];
        const quarterField =
            metric === "pop"
                ? "total_pops_per_quarter"
                : "total_ftes_per_quarter";

        let firstFtesRow = department[quarterField].find(
            (row) => row.year === firstYear && row.quarter === firstQuarter,
        );
        let firstFtesCount =
            this.sumRowsForDepartmentOrGlobalQuarterOrFiscalYear(firstFtesRow);

        let secondFtesRow = department[quarterField].find(
            (row) => row.year === secondYear && row.quarter === secondQuarter,
        );

        let secondFtesCount =
            this.sumRowsForDepartmentOrGlobalQuarterOrFiscalYear(secondFtesRow);
        let diff = secondFtesCount - firstFtesCount;
        return {
            department_id: deptId,
            department_name_en: departmentMeta.name_en,
            department_name_fr: departmentMeta.name_fr,
            department_acronym_en: departmentMeta.acronym_en,
            department_acronym_fr: departmentMeta.acronym_fr,
            relativeDiff:
                firstFtesCount === 0
                    ? null
                    : ((diff / firstFtesCount) * 100).toFixed(2),
            first: firstFtesCount.toFixed(2),
            absoluteDiff: diff.toFixed(2),
            from: firstFtesCount.toFixed(2),
            to: secondFtesCount.toFixed(2),
        };
    }

    diffDepartmentsForQuarters(
        firstYear,
        firstQuarter,
        secondYear,
        secondQuarter,
        metric = "fte",
    ) {
        let diffs = [];

        Object.keys(this.departments).forEach((deptId) => {
            diffs.push(
                this.diffDepartmentForQuarter(
                    deptId,
                    firstYear,
                    firstQuarter,
                    secondYear,
                    secondQuarter,
                    metric,
                ),
            );
        });

        return diffs;
    }

    compareTwoQuartersDepartments(
        firstYear,
        firstQuarter,
        secondYear,
        secondQuarter,
        metric = "fte",
    ) {
        let deptDiffs = this.diffDepartmentsForQuarters(
            firstYear,
            firstQuarter,
            secondYear,
            secondQuarter,
            metric,
        );
        let topAbsoluteGains = deptDiffs
            .sort((a, b) => b.absoluteDiff - a.absoluteDiff)
            .slice(0, 3);

        let topAbsoluteDeclines = deptDiffs
            .sort((a, b) => a.absoluteDiff - b.absoluteDiff)
            .slice(0, 3);

        let topRelativeGains = deptDiffs
            .filter((diff) => diff.relativeDiff !== null)
            .sort((a, b) => b.relativeDiff - a.relativeDiff)
            .slice(0, 3);

        let topRelativeDeclines = deptDiffs
            .filter((diff) => diff.relativeDiff !== null)
            .sort((a, b) => a.relativeDiff - b.relativeDiff)
            .slice(0, 3);

        return {
            top_absolute_gains: topAbsoluteGains,
            top_absolute_declines: topAbsoluteDeclines,
            top_relative_gains: topRelativeGains,
            top_relative_declines: topRelativeDeclines,
        };
    }

    diffCategory(firstValue, secondValue) {
        const absoluteDiff = secondValue - firstValue;
        const relativeDiff =
            firstValue === 0 ? null : (absoluteDiff / firstValue) * 100;
        return {
            from: firstValue.toFixed(2),
            to: secondValue.toFixed(2),
            absoluteDiff: absoluteDiff.toFixed(2),
            relativeDiff:
                relativeDiff === null ? null : relativeDiff.toFixed(2),
        };
    }

    compareTwoQuartersGeneral(
        firstYear,
        firstQuarter,
        secondYear,
        secondQuarter,
        includeCombined = true,
        metric = "fte",
    ) {
        const total_ftes_per_quarters =
            metric === "pop"
                ? this.aggregator.totalPopsPerQuarter()
                : this.aggregator.totalFtesPerQuarter();
        let firstQuarterRow = total_ftes_per_quarters.find(
            (row) => row.year === firstYear && row.quarter === firstQuarter,
        );
        let secondQuarterRow = total_ftes_per_quarters.find(
            (row) => row.year === secondYear && row.quarter === secondQuarter,
        );

        let absoluteDiff =
            this.sumRowsForDepartmentOrGlobalQuarterOrFiscalYear(
                secondQuarterRow,
                includeCombined,
            ) -
            this.sumRowsForDepartmentOrGlobalQuarterOrFiscalYear(
                firstQuarterRow,
                includeCombined,
            );
        let relativeDiff =
            firstQuarterRow.total_ftes === 0
                ? null
                : (absoluteDiff /
                      this.sumRowsForDepartmentOrGlobalQuarterOrFiscalYear(
                          firstQuarterRow,
                          includeCombined,
                      )) *
                  100;

        return {
            from: this.sumRowsForDepartmentOrGlobalQuarterOrFiscalYear(
                firstQuarterRow,
                includeCombined,
            ).toFixed(2),
            to: this.sumRowsForDepartmentOrGlobalQuarterOrFiscalYear(
                secondQuarterRow,
                includeCombined,
            ).toFixed(2),
            absoluteDiff: absoluteDiff.toFixed(2),
            relativeDiff:
                relativeDiff === null ? null : relativeDiff.toFixed(2),
            tenures: {
                indeterminate: this.diffCategory(
                    firstQuarterRow.indeterminate || 0,
                    secondQuarterRow.indeterminate || 0,
                ),
                term: this.diffCategory(
                    firstQuarterRow.term || 0,
                    secondQuarterRow.term || 0,
                ),
                student: this.diffCategory(
                    firstQuarterRow.student || 0,
                    secondQuarterRow.student || 0,
                ),
                casual: this.diffCategory(
                    firstQuarterRow.casual || 0,
                    secondQuarterRow.casual || 0,
                ),
            },
        };
    }

    buildQuarterlyComparison() {
        // We will build an overview that includes:
        // - Comparison of tenures between latest quarter and previous quarter
        // - Comparison of tenures between latest quarter and same quarter last year
        // - Top 3 departments with highest FTEs growth between latest quarter and previous quarter
        // - Top 3 departments with highest FTEs growth between latest quarter and same quarter last year
        // - Top 3 departments with highest FTEs decline between latest quarter and previous quarter
        // - Top 3 departments with highest FTEs decline between latest quarter and same quarter last year

        const total_ftes_per_quarter = this.aggregator.totalFtesPerQuarter();
        const latestYear = Math.max(
            ...Object.values(total_ftes_per_quarter).map((yrq) => yrq.year),
        );
        const latestQuarter = Math.max(
            ...Object.values(total_ftes_per_quarter)
                .filter((yrq) => yrq.year === latestYear)
                .map((yrq) => yrq.quarter),
        );

        const previousQuarter =
            latestQuarter === 1
                ? { year: latestYear - 1, quarter: 4 }
                : { year: latestYear, quarter: latestQuarter - 1 };
        const sameQuarterLastYear = {
            year: latestYear - 1,
            quarter: latestQuarter,
        };

        return {
            latestYear: latestYear,
            latestQuarter: latestQuarter,
            comparisons: {
                previousQuarter: {
                    year: previousQuarter.year,
                    quarter: previousQuarter.quarter,
                    general: this.compareTwoQuartersGeneral(
                        previousQuarter.year,
                        previousQuarter.quarter,
                        latestYear,
                        latestQuarter,
                    ),
                    generalPop: this.compareTwoQuartersGeneral(
                        previousQuarter.year,
                        previousQuarter.quarter,
                        latestYear,
                        latestQuarter,
                        true,
                        "pop",
                    ),
                    generalExcludingCombined: this.compareTwoQuartersGeneral(
                        previousQuarter.year,
                        previousQuarter.quarter,
                        latestYear,
                        latestQuarter,
                        false,
                    ),
                    generalExcludingCombinedPop: this.compareTwoQuartersGeneral(
                        previousQuarter.year,
                        previousQuarter.quarter,
                        latestYear,
                        latestQuarter,
                        false,
                        "pop",
                    ),
                    departments: this.compareTwoQuartersDepartments(
                        previousQuarter.year,
                        previousQuarter.quarter,
                        latestYear,
                        latestQuarter,
                    ),
                    departmentsPop: this.compareTwoQuartersDepartments(
                        previousQuarter.year,
                        previousQuarter.quarter,
                        latestYear,
                        latestQuarter,
                        "pop",
                    ),
                },
                sameQuarterLastYear: {
                    year: sameQuarterLastYear.year,
                    quarter: sameQuarterLastYear.quarter,
                    general: this.compareTwoQuartersGeneral(
                        sameQuarterLastYear.year,
                        sameQuarterLastYear.quarter,
                        latestYear,
                        latestQuarter,
                    ),
                    generalPop: this.compareTwoQuartersGeneral(
                        sameQuarterLastYear.year,
                        sameQuarterLastYear.quarter,
                        latestYear,
                        latestQuarter,
                        true,
                        "pop",
                    ),
                    generalExcludingCombined: this.compareTwoQuartersGeneral(
                        sameQuarterLastYear.year,
                        sameQuarterLastYear.quarter,
                        latestYear,
                        latestQuarter,
                        false,
                    ),
                    generalExcludingCombinedPop: this.compareTwoQuartersGeneral(
                        sameQuarterLastYear.year,
                        sameQuarterLastYear.quarter,
                        latestYear,
                        latestQuarter,
                        false,
                        "pop",
                    ),
                    departments: this.compareTwoQuartersDepartments(
                        sameQuarterLastYear.year,
                        sameQuarterLastYear.quarter,
                        latestYear,
                        latestQuarter,
                    ),
                    departmentsPop: this.compareTwoQuartersDepartments(
                        sameQuarterLastYear.year,
                        sameQuarterLastYear.quarter,
                        latestYear,
                        latestQuarter,
                        "pop",
                    ),
                },
            },
        };
    }
};
