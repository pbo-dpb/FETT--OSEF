<template>
    <div
        v-if="data"
        class="grid grid-cols-4 gap-8">
        <div class="col-span-full flex items-center">
            <PreferredMetricPicker />
            <Separator />
            <PreferredComparisonPeriodPicker />
        </div>
        <div
            class="col-span-full grid grid-cols-4 space-y-8 rounded-sm border border-solid border-gray-300 p-4">
            <div class="col-span-full text-center">
                <h2 class="mb-8 text-2xl text-balance">
                    {{ strings.overview_size_heading }}
                </h2>
                <h3 class="font-medium">
                    {{ strings[overviewAllLabelKey] }}
                </h3>
                <p
                    class="text-3xl font-bold"
                    :class="{
                        'text-red-800': allDepartmentsAbsoluteDiff < 0,
                        'text-green-800': allDepartmentsAbsoluteDiff > 0,
                    }">
                    {{ numberFormatter(allDepartmentsAbsoluteDiff) }}
                    ({{ numberFormatter(allDepartmentsRelativeDiff, true) }}%)
                    <span v-if="allDepartmentsAbsoluteDiff > 0">↑</span>
                    <span v-else-if="allDepartmentsAbsoluteDiff < 0">↓</span>
                    <span v-else>-</span>
                </p>
            </div>
            <div class="col-span-full text-center md:col-span-2 xl:col-span-1">
                <h3 class="font-medium">
                    {{ strings.indeterminate_label }}
                </h3>
                <p  
                    class="text-xl"
                    :class="{
                        'text-red-800': indeterminateAbsoluteDiff < 0,
                        'text-green-800': indeterminateAbsoluteDiff > 0,
                    }">
                    {{ numberFormatter(indeterminateAbsoluteDiff) }}
                    ({{ numberFormatter(indeterminateRelativeDiff, true) }}%)
                    <span v-if="indeterminateAbsoluteDiff > 0">↑</span>
                    <span v-else-if="indeterminateAbsoluteDiff < 0">↓</span>
                    <span v-else>-</span>
                </p>
            </div>
            <div class="col-span-full text-center md:col-span-2 xl:col-span-1">
                <h3 class="font-medium">{{ strings.term_label }}</h3>
                <p
                    class="text-xl"
                    :class="{
                        'text-red-800': termAbsoluteDiff < 0,
                        'text-green-800': termAbsoluteDiff > 0,
                    }">
                    {{ numberFormatter(termAbsoluteDiff) }} ({{
                        numberFormatter(termRelativeDiff, true)
                    }}%)
                    <span v-if="termAbsoluteDiff > 0">↑</span>
                    <span v-else-if="termAbsoluteDiff < 0">↓</span>
                    <span v-else>-</span>
                </p>
            </div>
            <div class="col-span-full text-center md:col-span-2 xl:col-span-1">
                <h3 class="font-medium">{{ strings.student_label }}</h3>
                <p
                    class="text-xl"
                    :class="{
                        'text-red-800': studentAbsoluteDiff < 0,
                        'text-green-800': studentAbsoluteDiff > 0,
                    }">
                    {{ numberFormatter(studentAbsoluteDiff) }} ({{
                        numberFormatter(studentRelativeDiff, true)
                    }}%)
                    <span v-if="studentAbsoluteDiff > 0">↑</span>
                    <span v-else-if="studentAbsoluteDiff < 0">↓</span>
                    <span v-else>-</span>
                </p>
            </div>
            <div class="col-span-full text-center md:col-span-2 xl:col-span-1">
                <h3 class="font-medium">{{ strings.casual_label }}</h3>
                <p
                    class="text-xl"
                    :class="{
                        'text-red-800': casualAbsoluteDiff < 0,
                        'text-green-800': casualAbsoluteDiff > 0,
                    }">
                    {{ numberFormatter(casualAbsoluteDiff) }} ({{
                        numberFormatter(casualRelativeDiff, true)
                    }}%)
                    <span v-if="casualAbsoluteDiff > 0">↑</span>
                    <span v-else-if="casualAbsoluteDiff < 0">↓</span>
                    <span v-else>-</span>
                </p>
            </div>
            <div
                class="col-span-full text-right text-xs font-medium text-slate-500">
                {{ formattedDateLabel }}
            </div>
        </div>
        <div
            class="col-span-full flex flex-col space-y-4 rounded-sm border border-solid border-gray-300 p-4 md:col-span-2">
            <h2 class="mb-8 text-center text-2xl text-balance">
                {{ strings.overview_largest_increase_by_department }}
            </h2>
            <ol class="space-y-2">
                <li
                    v-for="department in topThreeDepartmentsIncrease"
                    :key="department.department_id">
                    <div class="font-medium">
                        {{ displayDepartmentName(department) }}
                        <span
                            v-if="
                                department.department_acronym_en ||
                                department.department_acronym_fr
                            "
                            >({{ displayDepartmentAcronym(department) }})</span
                        >
                    </div>
                    <div
                        :class="{
                            'text-red-800': department.absoluteDiff < 0,
                            'text-green-800': department.absoluteDiff > 0,
                        }">
                        <span
                            >{{ numberFormatter(department.absoluteDiff) }}
                        </span>
                        ({{ numberFormatter(department.relativeDiff, true) }}%)
                        <span v-if="department.absoluteDiff > 0">↑</span>
                        <span v-else-if="department.absoluteDiff < 0">↓</span>
                        <span v-else>-</span>
                    </div>
                </li>
            </ol>
            <div
                class="col-span-full text-right text-xs font-medium text-slate-500">
                {{ formattedDateLabel }}
            </div>
        </div>
        <div
            class="col-span-full flex flex-col space-y-4 rounded-sm border border-solid border-gray-300 p-4 md:col-span-2">
            <h2 class="mb-8 text-center text-2xl text-balance">
                {{ strings.overview_largest_decrease_by_department }}
            </h2>
            <ol class="space-y-2">
                <li
                    v-for="department in topThreeDepartmentsDecrease"
                    :key="department.department_id">
                    <div class="font-medium">
                        {{ displayDepartmentName(department) }}
                        <span
                            v-if="
                                department.department_acronym_en ||
                                department.department_acronym_fr
                            "
                            >({{ displayDepartmentAcronym(department) }})</span
                        >
                    </div>
                    <div
                        :class="{
                            'text-red-800': department.absoluteDiff < 0,
                            'text-green-800': department.absoluteDiff > 0,
                        }">
                        <span
                            >{{ numberFormatter(department.absoluteDiff) }}
                        </span>
                        ({{ numberFormatter(department.relativeDiff, true) }}%)
                        <span v-if="department.absoluteDiff > 0">↑</span>
                        <span v-else-if="department.absoluteDiff < 0">↓</span>
                        <span v-else>-</span>
                    </div>
                </li>
            </ol>
            <div
                class="col-span-full text-right text-xs font-medium text-slate-500">
                {{ formattedDateLabel }}
            </div>
        </div>
        <div class="col-span-full">
            <Button type="default" href="./sample-input.xlsx">{{ strings.download_button }}</Button>
        </div>
    </div>
    <div v-else>
        <LoadingIndicator class="size-6" />
    </div>
</template>

<script>
    import LoadingIndicator from "../LoadingIndicator.vue";
    import Button from "../Button.vue";
    import Separator from "../Separator.vue";
    import PreferredComparisonPeriodPicker from "../PreferredComparisonPeriodPicker.vue";
    import PreferredMetricPicker from "../PreferredMetricPicker.vue";
    import numberFormatter from "../../mixins/numberFormatter.js";
    import { formatAsOfDateLabel } from "../../mixins/formattedDateLabel.js";

    import { storeToRefs } from "pinia";

    import useLocalizationsStore from "../../stores/localizations.js";

    import usePayloadsStore from "../../stores/payloads.js";
    import useSettingsStore from "../../stores/settings.js";

    import { toRaw } from "vue";

    export default {
        components: {
            LoadingIndicator,
            Button,
            Separator,
            PreferredComparisonPeriodPicker,
            PreferredMetricPicker,
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
                    return this.comparisonData?.generalPop;
                }

                return this.comparisonData?.general;
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
