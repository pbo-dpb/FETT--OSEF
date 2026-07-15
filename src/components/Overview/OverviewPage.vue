<template>
    <div
        v-if="data"
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

        <OverviewPanelCurrentNumbers />

        <OverviewPanelLatestChanges :deltaDataLabel="deltaDataLabel" />

        <OverviewPanel
            :header="strings.overview_largest_increase_by_department"
            :departmentsList="topThreeDepartmentsIncrease"
            :deltaDataLabel="deltaDataLabel" />

        <OverviewPanel
            :header="strings.overview_largest_decrease_by_department"
            :departmentsList="topThreeDepartmentsDecrease"
            :deltaDataLabel="deltaDataLabel" />

        <div class="col-span-full">
            <p class="text-sm">{{ strings.overview_end_note }}</p>
        </div>

        <!-- Download Button -->
        <div class="col-span-full">
            <a
                href="./20260512.xlsx"
                download="Federal-Employment-Tracking-Tool-Data--Outil-de-suivi-de-l-emploi-dans-la-fonction-publique-fédérale-Données"
                class="bg-primary bg-primary-hover focus-outline-primary cursor-pointer rounded-sm px-4 py-2 font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid"
                >{{ strings.overview_download_button }}</a
            >
        </div>
    </div>
    <div v-else>
        <LoadingIndicator class="size-6" />
    </div>
</template>

<script>
    import { storeToRefs } from "pinia";

    import usePayloadsStore from "@/stores/payloads.js";
    import useSettingsStore from "@/stores/settings.js";
    import useLocalizationsStore from "@/stores/localizations.js";

    import {
        LoadingIndicator,
        PageHeader,
        PreferredComparisonPeriodPicker,
        PreferredMetricPicker,
        OverviewPanelCurrentNumbers,
        OverviewPanelLatestChanges,
        OverviewPanel,
    } from "@/components/Shared";

    export default {
        components: {
            PageHeader,
            LoadingIndicator,
            PreferredComparisonPeriodPicker,
            PreferredMetricPicker,
            OverviewPanelCurrentNumbers,
            OverviewPanelLatestChanges,
            OverviewPanel,
        },
        data() {
            return {
                data: null,
                isLoading: false,
            };
        },
        computed: {
            preferredMetric() {
                const settingsStore = useSettingsStore();

                return settingsStore.preferredMetric;
            },
            selectedComparisonPeriod() {
                const settingsStore = useSettingsStore();

                return settingsStore.selectedComparisonPeriod;
            },
            strings() {
                const localizationsStore = useLocalizationsStore();

                return localizationsStore.strings;
            },
            language() {
                const localizationsStore = useLocalizationsStore();

                return localizationsStore.language;
            },

            comparisonData() {
                return this.data?.quarterly?.comparisons[
                    this.selectedComparisonPeriod
                ];
            },

            departmentsComparison() {
                if (this.preferredMetric === "pop") {
                    return this.comparisonData?.departmentsPop;
                }

                return this.comparisonData?.departments;
            },

            topThreeDepartmentsIncrease() {
                return this.departmentsComparison?.top_absolute_gains;
            },

            topThreeDepartmentsDecrease() {
                return this.departmentsComparison?.top_absolute_declines;
            },

            deltaDataLabel() {
                const { strings } = useLocalizationsStore();
                const {
                    preferredMetric,
                    selectedComparisonPeriod,
                    end_quarter,
                    end_year,
                } = useSettingsStore();
                const baseString =
                    preferredMetric === "fte"
                        ? strings.department_change_ftes_between
                        : strings.department_change_pops_between;
                let start_quarter, start_year;

                if (selectedComparisonPeriod === "sameQuarterLastYear") {
                    start_quarter = end_quarter;
                    start_year = end_year - 1;
                } else {
                    start_quarter = end_quarter === 1 ? 4 : end_quarter - 1;
                    start_year = end_quarter === 1 ? end_year - 1 : end_year;
                }

                return baseString
                    .replace("{start_quarter}", start_quarter)
                    .replace("{start_year}", start_year)
                    .replace("{end_quarter}", end_quarter)
                    .replace("{end_year}", end_year);
            },
        },
        async mounted() {
            const payloadsStore = usePayloadsStore();
            const { overview } = storeToRefs(payloadsStore);

            this.isLoading = true;

            if (overview.value === false) {
                await payloadsStore.fetchOverview();
            }

            this.data = overview.value;
            this.isLoading = false;
        },
    };
</script>
