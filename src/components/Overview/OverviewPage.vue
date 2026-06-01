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

        <!-- Panel 1 -->
        <div
            class="col-span-full grid grid-cols-4 space-y-8 rounded-sm border border-solid border-gray-300 p-4 md:col-span-2">
            <div class="col-span-full text-center">
                <h3 class="mb-8 text-2xl text-balance">
                    {{ strings.overview_current_numbers }}
                </h3>
                <h4 class="font-semibold">
                    {{ strings[overviewAllLabelKey] }}
                </h4>
                <p class="text-3xl font-bold">
                    {{ numberFormatter(allDepartmentsLatestNumber) }}
                </p>
            </div>
            <div class="3xl:col-span-1 col-span-full text-center lg:col-span-2">
                <h4 class="font-semibold">
                    {{ strings.indeterminate_label }}
                </h4>
                <p class="text-xl">
                    {{ numberFormatter(indeterminateLatestNumber) }}
                </p>
            </div>
            <div class="3xl:col-span-1 col-span-full text-center lg:col-span-2">
                <h4 class="font-semibold">{{ strings.term_label }}</h4>
                <p class="text-xl">
                    {{ numberFormatter(termLatestNumber) }}
                </p>
            </div>
            <div class="3xl:col-span-1 col-span-full text-center lg:col-span-2">
                <h4 class="font-semibold">{{ strings.student_label }}</h4>
                <p class="text-xl">
                    {{ numberFormatter(studentLatestNumber) }}
                </p>
            </div>
            <div class="3xl:col-span-1 col-span-full text-center lg:col-span-2">
                <h4 class="font-semibold">{{ strings.casual_label }}</h4>
                <p class="text-xl">
                    {{ numberFormatter(casualLatestNumber) }}
                </p>
            </div>
            <div class="col-span-full text-right text-xs font-semibold">
                {{ currentDataLabel }}
            </div>
        </div>

        <!-- Panel 2 -->
        <div
            class="col-span-full grid grid-cols-4 space-y-8 rounded-sm border border-solid border-gray-300 p-4 md:col-span-2">
            <div class="col-span-full text-center">
                <h3 class="mb-8 text-2xl text-balance">
                    {{ strings.overview_delta }}
                </h3>
                <h4 class="font-semibold">
                    {{ strings[overviewAllLabelKey] }}
                </h4>
                <p class="text-3xl font-bold">
                    {{ numberFormatter(allDepartmentsAbsoluteDiff) }}
                    ({{ numberFormatter(allDepartmentsRelativeDiff, true) }}%)
                    <TrendIndicator :datapoint="allDepartmentsAbsoluteDiff" />
                </p>
            </div>
            <div class="3xl:col-span-1 col-span-full text-center lg:col-span-2">
                <h4 class="font-semibold">
                    {{ strings.indeterminate_label }}
                </h4>
                <p class="text-xl">
                    {{ numberFormatter(indeterminateAbsoluteDiff) }}
                    ({{ numberFormatter(indeterminateRelativeDiff, true) }}%)
                    <TrendIndicator :datapoint="indeterminateAbsoluteDiff" />
                </p>
            </div>
            <div class="3xl:col-span-1 col-span-full text-center lg:col-span-2">
                <h4 class="font-semibold">{{ strings.term_label }}</h4>
                <p class="text-xl">
                    {{ numberFormatter(termAbsoluteDiff) }} ({{
                        numberFormatter(termRelativeDiff, true)
                    }}%)
                    <TrendIndicator :datapoint="termAbsoluteDiff" />
                </p>
            </div>
            <div class="3xl:col-span-1 col-span-full text-center lg:col-span-2">
                <h4 class="font-semibold">{{ strings.student_label }}</h4>
                <p class="text-xl">
                    {{ numberFormatter(studentAbsoluteDiff) }} ({{
                        numberFormatter(studentRelativeDiff, true)
                    }}%)
                    <TrendIndicator :datapoint="studentAbsoluteDiff" />
                </p>
            </div>
            <div class="3xl:col-span-1 col-span-full text-center lg:col-span-2">
                <h4 class="font-semibold">{{ strings.casual_label }}</h4>
                <p class="text-xl">
                    {{ numberFormatter(casualAbsoluteDiff) }} ({{
                        numberFormatter(casualRelativeDiff, true)
                    }}%)
                    <TrendIndicator :datapoint="casualAbsoluteDiff" />
                </p>
            </div>
            <div class="col-span-full text-right text-xs font-semibold">
                {{ deltaDataLabel }}
            </div>
        </div>

        <!-- Panel 3 -->
        <div
            class="col-span-full flex flex-col space-y-4 rounded-sm border border-solid border-gray-300 p-4 md:col-span-2">
            <h3 class="mb-8 text-center text-2xl text-balance">
                {{ strings.overview_largest_increase_by_department }}
            </h3>
            <ol class="space-y-2">
                <li
                    v-for="department in topThreeDepartmentsIncrease"
                    :key="department.department_id">
                    <h4 class="font-semibold">
                        {{ displayDepartmentName(department) }}
                        <span
                            v-if="
                                department.department_acronym_en ||
                                department.department_acronym_fr
                            "
                            >({{ displayDepartmentAcronym(department) }})</span
                        >
                    </h4>
                    <p>
                        <span
                            >{{ numberFormatter(department.absoluteDiff) }}
                        </span>
                        ({{ numberFormatter(department.relativeDiff, true) }}%)
                        <TrendIndicator :datapoint="department.absoluteDiff" />
                    </p>
                </li>
            </ol>
            <div class="col-span-full text-right text-xs font-semibold">
                {{ deltaDataLabel }}
            </div>
        </div>

        <!-- Panel 4 -->
        <div
            class="col-span-full flex flex-col space-y-4 rounded-sm border border-solid border-gray-300 p-4 md:col-span-2">
            <h3 class="mb-8 text-center text-2xl text-balance">
                {{ strings.overview_largest_decrease_by_department }}
            </h3>
            <ol class="space-y-2">
                <li
                    v-for="department in topThreeDepartmentsDecrease"
                    :key="department.department_id">
                    <h4 class="font-semibold">
                        {{ displayDepartmentName(department) }}
                        <span
                            v-if="
                                department.department_acronym_en ||
                                department.department_acronym_fr
                            "
                            >({{ displayDepartmentAcronym(department) }})</span
                        >
                    </h4>
                    <div>
                        <span
                            >{{ numberFormatter(department.absoluteDiff) }}
                        </span>
                        ({{ numberFormatter(department.relativeDiff, true) }}%)
                        <TrendIndicator :datapoint="department.absoluteDiff" />
                    </div>
                </li>
            </ol>
            <div class="col-span-full text-right text-xs font-semibold">
                {{ deltaDataLabel }}
            </div>
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
    import { toRaw } from "vue";
    import { storeToRefs } from "pinia";

    import numberFormatter from "@/mixins/numberFormatter.js";

    import usePayloadsStore from "@/stores/payloads.js";
    import useSettingsStore from "@/stores/settings.js";
    import useLocalizationsStore from "@/stores/localizations.js";

    import {
        LoadingIndicator,
        PageHeader,
        PreferredComparisonPeriodPicker,
        PreferredMetricPicker,
        TrendIndicator,
    } from "@/components/Shared";

    export default {
        components: {
            PageHeader,
            LoadingIndicator,
            PreferredComparisonPeriodPicker,
            PreferredMetricPicker,
            TrendIndicator,
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
            currentDataLabel() {
                const { strings } = useLocalizationsStore();
                const { preferredMetric, end_quarter, end_year } =
                    useSettingsStore();
                const baseString =
                    preferredMetric === "fte"
                        ? strings.department_latest_ftes_as_of
                        : strings.department_latest_pops_as_of;

                return baseString
                    .replace("{quarter}", end_quarter)
                    .replace("{year}", end_year);
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
            comparisonData() {
                return this.data?.quarterly?.comparisons[
                    this.selectedComparisonPeriod
                ];
            },
            generalComparison() {
                if (this.preferredMetric === "pop") {
                    return this.comparisonData?.generalExcludingCombinedPop;
                }

                return this.comparisonData?.generalExcludingCombined;
            },
            departmentsComparison() {
                if (this.preferredMetric === "pop") {
                    return this.comparisonData?.departmentsPop;
                }

                return this.comparisonData?.departments;
            },
            overviewAllLabelKey() {
                return this.preferredMetric === "pop"
                    ? "overview_all_headcount_label"
                    : "overview_all_positions_label";
            },

            allDepartmentsLatestNumber() {
                return this.generalComparison?.to;
            },
            indeterminateLatestNumber() {
                return this.generalComparison?.tenures?.indeterminate?.to;
            },
            termLatestNumber() {
                return this.generalComparison?.tenures?.term?.to;
            },
            studentLatestNumber() {
                return this.generalComparison?.tenures?.student?.to;
            },
            casualLatestNumber() {
                return this.generalComparison?.tenures?.casual?.to;
            },

            allDepartmentsAbsoluteDiff() {
                return this.generalComparison?.absoluteDiff;
            },
            allDepartmentsRelativeDiff() {
                return this.generalComparison?.relativeDiff;
            },
            indeterminateAbsoluteDiff() {
                return this.generalComparison?.tenures?.indeterminate
                    ?.absoluteDiff;
            },
            indeterminateRelativeDiff() {
                return this.generalComparison?.tenures?.indeterminate
                    ?.relativeDiff;
            },
            termAbsoluteDiff() {
                return this.generalComparison?.tenures?.term?.absoluteDiff;
            },
            termRelativeDiff() {
                return this.generalComparison?.tenures?.term?.relativeDiff;
            },
            studentAbsoluteDiff() {
                return this.generalComparison?.tenures?.student?.absoluteDiff;
            },
            studentRelativeDiff() {
                return this.generalComparison?.tenures?.student?.relativeDiff;
            },
            casualAbsoluteDiff() {
                return this.generalComparison?.tenures?.casual?.absoluteDiff;
            },
            casualRelativeDiff() {
                return this.generalComparison?.tenures?.casual?.relativeDiff;
            },
            topThreeDepartmentsIncrease() {
                return this.departmentsComparison?.top_absolute_gains;
            },
            topThreeDepartmentsDecrease() {
                return this.departmentsComparison?.top_absolute_declines;
            },
        },
        methods: {
            displayDepartmentName(department) {
                return this.language === "fr"
                    ? department.department_name_fr
                    : department.department_name_en;
            },
            displayDepartmentAcronym(department) {
                return this.language === "fr"
                    ? department.department_acronym_fr
                    : department.department_acronym_en;
            },
        },
        mixins: [numberFormatter],
        async mounted() {
            const payloadsStore = usePayloadsStore();
            const { overview } = storeToRefs(payloadsStore);

            this.isLoading = true;

            if (overview.value === false) {
                await payloadsStore.fetchOverview();
            }

            this.data = overview.value;
            this.isLoading = false;

            console.log(toRaw(overview.value));
        },
    };
</script>
