<template>
    <div
        v-if="data"
        class="grid grid-cols-4 gap-8">
        <div class="col-span-full">
            <PageHeader
                :heading="strings.overview_heading"
                :description="strings.overview_description" />
        </div>
        <div class="col-span-full flex flex-wrap items-center gap-x-8 gap-y-4">
            <PreferredMetricPicker />
            <PreferredComparisonPeriodPicker />
        </div>
        <div
            class="col-span-full grid grid-cols-4 space-y-8 rounded-sm border border-solid border-gray-300 p-4">
            <div class="col-span-full text-center">
                <h3 class="mb-8 text-2xl text-balance">
                    {{ strings.overview_general_trends }}
                </h3>
                <h3 class="font-semibold">
                    {{ strings[overviewAllLabelKey] }}
                </h3>
                <p class="text-3xl font-bold">
                    {{ numberFormatter(allDepartmentsAbsoluteDiff) }}
                    ({{ numberFormatter(allDepartmentsRelativeDiff, true) }}%)
                    <TrendIndicator :datapoint="allDepartmentsAbsoluteDiff" />
                </p>
            </div>
            <div class="col-span-full text-center md:col-span-2 xl:col-span-1">
                <h4 class="font-semibold">
                    {{ strings.indeterminate_label }}
                </h4>
                <p class="text-xl">
                    {{ numberFormatter(indeterminateAbsoluteDiff) }}
                    ({{ numberFormatter(indeterminateRelativeDiff, true) }}%)
                    <TrendIndicator :datapoint="indeterminateAbsoluteDiff" />
                </p>
            </div>
            <div class="col-span-full text-center md:col-span-2 xl:col-span-1">
                <h4 class="font-semibold">{{ strings.term_label }}</h4>
                <p class="text-xl">
                    {{ numberFormatter(termAbsoluteDiff) }} ({{
                        numberFormatter(termRelativeDiff, true)
                    }}%)
                    <TrendIndicator :datapoint="termAbsoluteDiff" />
                </p>
            </div>
            <div class="col-span-full text-center md:col-span-2 xl:col-span-1">
                <h4 class="font-semibold">{{ strings.student_label }}</h4>
                <p class="text-xl">
                    {{ numberFormatter(studentAbsoluteDiff) }} ({{
                        numberFormatter(studentRelativeDiff, true)
                    }}%)
                    <TrendIndicator :datapoint="studentAbsoluteDiff" />
                </p>
            </div>
            <div class="col-span-full text-center md:col-span-2 xl:col-span-1">
                <h4 class="font-semibold">{{ strings.casual_label }}</h4>
                <p class="text-xl">
                    {{ numberFormatter(casualAbsoluteDiff) }} ({{
                        numberFormatter(casualRelativeDiff, true)
                    }}%)
                    <TrendIndicator :datapoint="casualAbsoluteDiff" />
                </p>
            </div>
            <div class="col-span-full text-right text-xs font-semibold">
                {{ formattedDateLabel }}
            </div>
        </div>
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
                {{ formattedDateLabel }}
            </div>
        </div>
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
                {{ formattedDateLabel }}
            </div>
        </div>
        <div class="col-span-full">
            <BaseButton
                type="default"
                href="./sample-input-current.xlsx"
                >{{ strings.overview_download_button }}</BaseButton
            >
        </div>
    </div>
    <div v-else>
        <LoadingIndicator class="size-6" />
    </div>
</template>

<script>
    import PageHeader from "../Shared/UI/PageHeader.vue";
    import LoadingIndicator from "@/components/Shared/UI/LoadingIndicator.vue";
    import BaseButton from "@/components/Shared/UI/BaseButton.vue";
    import TrendIndicator from "../Shared/UI/TrendIndicator.vue";
    import PreferredComparisonPeriodPicker from "@/components/Shared/Controls/Chart/PreferredComparisonPeriodPicker.vue";
    import PreferredMetricPicker from "@/components/Shared/Controls/Chart/PreferredMetricPicker.vue";
    import numberFormatter from "@/mixins/numberFormatter.js";
    import { formatAsOfDateLabel } from "@/mixins/formattedDateLabel.js";

    import { storeToRefs } from "pinia";

    import useLocalizationsStore from "@/stores/localizations.js";

    import usePayloadsStore from "@/stores/payloads.js";
    import useSettingsStore from "@/stores/settings.js";

    import { toRaw } from "vue";

    export default {
        components: {
            PageHeader,
            BaseButton,
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
            formattedDateLabel() {
                const settingsStore = useSettingsStore();

                return formatAsOfDateLabel({
                    preferredMetric: settingsStore.preferredMetric,
                    preferredGranularity: settingsStore.preferredGranularity,
                    language: this.language,
                    strings: this.strings,
                    year: settingsStore.end_year,
                    quarter: settingsStore.end_quarter,
                });
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

            console.log(toRaw(this.data.quarterly.comparisons));
        },
    };
</script>
