module.exports = class Overviewer {

    constructor(aggregator, departments, departmentsDetails) {
        this.aggregator = aggregator;
        this.departments = departments;
        this.departmentsDetails = departmentsDetails;
    }


    sumRowsForDepartmentOrGlobalQuarterOrFiscalYear(row, includeCombined = true) {
        let total = 0;

        total += (row.indeterminate || 0)
            + (row.term || 0)
            + (row.casual || 0)
            + (row.student || 0);
        if (includeCombined) {
            total += (row.combined || 0);
        }
        return total;
    }

    diffDepartmentForQuarter(deptId, firstYear, firstQuarter, secondYear, secondQuarter) {

        let department = this.departmentsDetails[deptId];

        let firstFtesRow = department.total_ftes_per_quarter.find(row => row.year === firstYear && row.quarter === firstQuarter);
        let firstFtesCount = this.sumRowsForDepartmentOrGlobalQuarterOrFiscalYear(firstFtesRow);

        let secondFtesRow = department.total_ftes_per_quarter.find(row => row.year === secondYear && row.quarter === secondQuarter);

        let secondFtesCount = this.sumRowsForDepartmentOrGlobalQuarterOrFiscalYear(secondFtesRow);
        let diff = secondFtesCount - firstFtesCount;
        return {
            department_id: deptId,
            relativeDiff: Number(firstFtesCount === 0 ? null : (diff / firstFtesCount) * 100).toFixed(2),
            first: Number(firstFtesCount).toFixed(2),
            absoluteDiff: Number(diff).toFixed(2),
            from: Number(firstFtesCount).toFixed(2),
            to: Number(secondFtesCount).toFixed(2)
        };
    }

    diffDepartmentsForQuarters(firstYear, firstQuarter, secondYear, secondQuarter) {

        let diffs = []

        Object.keys(this.departments).forEach(deptId => {
            diffs.push(this.diffDepartmentForQuarter(deptId, firstYear, firstQuarter, secondYear, secondQuarter));
        });


        return diffs;
    }


    compareTwoQuartersDepartments(firstYear, firstQuarter, secondYear, secondQuarter) {

        let deptDiffs = this.diffDepartmentsForQuarters(firstYear, firstQuarter, secondYear, secondQuarter);
        let topAbsoluteGains = deptDiffs
            .sort((a, b) => b.absoluteDiff - a.absoluteDiff)
            .slice(0, 3);

        let topAbsoluteDeclines = deptDiffs
            .sort((a, b) => a.absoluteDiff - b.absoluteDiff)
            .slice(0, 3);

        let topRelativeGains = deptDiffs
            .filter(diff => diff.relativeDiff !== null)
            .sort((a, b) => b.relativeDiff - a.relativeDiff)
            .slice(0, 3);

        let topRelativeDeclines = deptDiffs
            .filter(diff => diff.relativeDiff !== null)
            .sort((a, b) => a.relativeDiff - b.relativeDiff)
            .slice(0, 3);

        return {
            top_absolute_gains: topAbsoluteGains,
            top_absolute_declines: topAbsoluteDeclines,
            top_relative_gains: topRelativeGains,
            top_relative_declines: topRelativeDeclines
        };
    }

    compareTwoQuartersGeneral(firstYear, firstQuarter, secondYear, secondQuarter, includeCombined = true) {

        const total_ftes_per_quarters = this.aggregator.totalFtesPerQuarter();
        let firstQuarterRow = total_ftes_per_quarters.find(row => row.year === firstYear && row.quarter === firstQuarter);
        let secondQuarterRow = total_ftes_per_quarters.find(row => row.year === secondYear && row.quarter === secondQuarter);

        let absoluteDiff = this.sumRowsForDepartmentOrGlobalQuarterOrFiscalYear(secondQuarterRow, includeCombined) - this.sumRowsForDepartmentOrGlobalQuarterOrFiscalYear(firstQuarterRow, includeCombined);
        let relativeDiff = firstQuarterRow.total_ftes === 0 ? null : (absoluteDiff / this.sumRowsForDepartmentOrGlobalQuarterOrFiscalYear(firstQuarterRow, includeCombined)) * 100;


        return {
            from: Number(this.sumRowsForDepartmentOrGlobalQuarterOrFiscalYear(firstQuarterRow, includeCombined)).toFixed(2),
            to: Number(this.sumRowsForDepartmentOrGlobalQuarterOrFiscalYear(secondQuarterRow, includeCombined)).toFixed(2),
            absoluteDiff: Number(absoluteDiff).toFixed(2),
            relativeDiff: relativeDiff === null ? null : Number(relativeDiff).toFixed(2)
        };

    }


    buildQuarterlyComparison() {


        // We will build an overview that includes:
        // - Comparison of tenures between latest quarter and previous quarter
        // - Comparison of tenures between latest quarter and same quarter last year
        // - Top 3 departments with highest FTEs growth betwen latest quarter and previous quarter
        // - Top 3 departments with highest FTEs growth betwen latest quarter and same quarter last year
        // - Top 3 departments with highest FTEs decline betwen latest quarter and previous quarter
        // - Top 3 departments with highest FTEs decline betwen latest quarter and same quarter last year

        const total_ftes_per_quarter = this.aggregator.totalFtesPerQuarter();
        const latestYear = Math.max(...Object.values(total_ftes_per_quarter).map(yrq => yrq.year));
        const latestQuarter = Math.max(...Object.values(total_ftes_per_quarter).filter(yrq => yrq.year === latestYear).map(yrq => yrq.quarter));

        const previousQuarter = latestQuarter === 1 ? { year: latestYear - 1, quarter: 4 } : { year: latestYear, quarter: latestQuarter - 1 };
        const sameQuarterLastYear = { year: latestYear - 1, quarter: latestQuarter };

        return {
            latestYear: latestYear,
            latestQuarter: latestQuarter,
            comparisons: {
                previousQuarter: {
                    year: previousQuarter.year,
                    quarter: previousQuarter.quarter,
                    general: this.compareTwoQuartersGeneral(previousQuarter.year, previousQuarter.quarter, latestYear, latestQuarter),
                    generalExcludingCombined: this.compareTwoQuartersGeneral(previousQuarter.year, previousQuarter.quarter, latestYear, latestQuarter, false),
                    departments: this.compareTwoQuartersDepartments(previousQuarter.year, previousQuarter.quarter, latestYear, latestQuarter)
                },
                sameQuarterLastYear: {
                    year: sameQuarterLastYear.year,
                    quarter: sameQuarterLastYear.quarter,
                    general: this.compareTwoQuartersGeneral(sameQuarterLastYear.year, sameQuarterLastYear.quarter, latestYear, latestQuarter),
                    generalExcludingCombined: this.compareTwoQuartersGeneral(sameQuarterLastYear.year, sameQuarterLastYear.quarter, latestYear, latestQuarter, false),
                    departments: this.compareTwoQuartersDepartments(sameQuarterLastYear.year, sameQuarterLastYear.quarter, latestYear, latestQuarter)
                }
            }
        }



    }

}
