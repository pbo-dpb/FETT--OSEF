import { defineStore } from "pinia";
import settings from "../assets/payloads/settings.json";
import { colors } from "../assets/echarts/colors.json";

const previouslySelectedDepartmentIds = sessionStorage.getItem(
    "selectedDepartmentIds",
);

export default defineStore("settings", {
    state: () => ({
        preferredMetric: "fte",
        preferredTimeframe: "MAX",
        preferredGranularity: "quarter",
        selectedComparisonPeriod: "sameQuarterLastYear",
        preferredTenure: "combined",
        showAllDepartments: false,
        colors: colors,
        previouslySelectedDepartmentIds: previouslySelectedDepartmentIds
            ? JSON.parse(previouslySelectedDepartmentIds).map((id) =>
                  id.replace(/[^a-z0-9]/gi, ""),
              )
            : [],
        ...settings,
    }),

    actions: {
        setPreferredMetric(metric) {
            this.preferredMetric = metric;
        },

        setSelectedComparisonPeriod(comparisonPeriod) {
            this.selectedComparisonPeriod = comparisonPeriod;
        },

        setShowAllDepartments(value) {
            this.showAllDepartments = value;
        },

        // since we rely on `this`, we cannot use an arrow function
        setPreviouslySelectedDepartmentIds(departmentIds) {
            sessionStorage.setItem(
                "selectedDepartmentIds",
                JSON.stringify(departmentIds),
            );
            this.previouslySelectedDepartmentIds = departmentIds;
        },
    },
});
