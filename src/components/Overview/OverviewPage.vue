<template>
    <div
        v-if="readyToRender"
        class="grid grid-cols-4 gap-8">
        <div class="col-span-full">
            <PageHeader
                :heading="strings.overview_heading"
                :description="strings.overview_description" />
        </div>
        <div
            class="col-span-full flex flex-wrap items-center gap-x-8 gap-y-4 rounded-sm bg-gray-100 p-4 dark:bg-gray-900">
            <PreferredMetricPicker />
            <PreferredComparisonPeriodPicker />
        </div>

        <OverviewPanelCurrentNumbers
            :header="strings.overview_current_numbers"
            :metric="currentMetric" />

        <OverviewPanelLatestChanges
            :header="strings.overview_delta"
            :metric="deltaMetric" />

        <OverviewPanelDepartmentsList
            :header="strings.overview_largest_increase_by_department"
            :metric="deltaMetric"
            :departments="departmentsWithLargestIncrease" />

        <OverviewPanelDepartmentsList
            :header="strings.overview_largest_decrease_by_department"
            :metric="deltaMetric"
            :departments="departmentsWithLargestDecrease" />

        <div class="col-span-full">
            <a
                href="./FETT_publicdata.xlsx"
                class="bg-primary bg-primary-hover focus-outline-primary cursor-pointer rounded-sm px-4 py-2 font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid"
                >{{ strings.overview_download_button }}</a
            >
        </div>

        <Footnotes :footnotes="[strings.overview_footnote]" />
    </div>
    <div v-else>
        <LoadingIndicator class="size-6" />
    </div>
</template>

<script setup>
    import { computed, onMounted, toRaw } from "vue";
    import { storeToRefs } from "pinia";

    import usePayloadsStore from "@/stores/payloads.js";
    import useSettingsStore from "@/stores/settings.js";
    import useLocalizationsStore from "@/stores/localizations.js";

    import OverviewPanelCurrentNumbers from "./OverviewPanelCurrentNumbers.vue";
    import OverviewPanelDepartmentsList from "./OverviewPanelDepartmentsList.vue";
    import OverviewPanelLatestChanges from "./OverviewPanelLatestChanges.vue";

    import {
        Footnotes,
        LoadingIndicator,
        PageHeader,
        PreferredComparisonPeriodPicker,
        PreferredMetricPicker,
    } from "@/components/Shared";

    const payloadsStore = usePayloadsStore();
    const settingsStore = useSettingsStore();
    const localizationsStore = useLocalizationsStore();

    const { overview } = storeToRefs(payloadsStore);
    const { preferredMetric, selectedComparisonPeriod, end_quarter, end_year } =
        storeToRefs(settingsStore);
    const { strings } = storeToRefs(localizationsStore);

    const comparisonData = computed(() => {
        return overview.value?.quarterly?.comparisons[
            selectedComparisonPeriod.value
        ];
    });

    const departmentsComparison = computed(() => {
        if (preferredMetric.value === "pop") {
            return comparisonData.value?.departmentsPop;
        }

        return comparisonData.value?.departments;
    });

    const currentMetric = computed(() => {
        const baseString =
            preferredMetric.value === "fte"
                ? strings.value.department_latest_ftes_as_of
                : strings.value.department_latest_pops_as_of;

        return baseString
            .replace("{quarter}", end_quarter.value)
            .replace("{year}", end_year.value);
    });

    const deltaMetric = computed(() => {
        const baseString =
            preferredMetric.value === "fte"
                ? strings.value.department_change_ftes_between
                : strings.value.department_change_pops_between;
        let start_quarter, start_year;

        switch (selectedComparisonPeriod.value) {
            case "sameQuarterLastYear":
                start_quarter = end_quarter.value;
                start_year = end_year.value - 1;
                break;
            case "previousQuarter":
                start_quarter =
                    end_quarter.value === 1 ? 4 : end_quarter.value - 1;
                start_year =
                    end_quarter.value === 1
                        ? end_year.value - 1
                        : end_year.value;
                break;
            case "peakFederalEmployment":
                start_quarter = 2;
                start_year = 2024;
                break;
        }

        return baseString
            .replace("{start_quarter}", start_quarter)
            .replace("{start_year}", start_year)
            .replace("{end_quarter}", end_quarter.value)
            .replace("{end_year}", end_year.value);
    });

    const departmentsWithLargestIncrease = computed(() => {
        return departmentsComparison.value?.top_absolute_gains;
    });

    const departmentsWithLargestDecrease = computed(() => {
        return departmentsComparison.value?.top_absolute_declines;
    });

    const readyToRender = computed(() => {
        return overview.value !== false;
    });

    onMounted(() => {
        if (overview.value === false) {
            payloadsStore.fetchOverview();
        }
    });
</script>
