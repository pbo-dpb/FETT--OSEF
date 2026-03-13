<template>
    <div
        v-if="data"
        class="grid grid-cols-4 gap-4">
        <div class="col-span-full flex justify-end gap-4">
            <div class="flex flex-col">
                <label
                    for="comparisonPeriod"
                    class="mb-1 text-sm font-medium"
                    >{{ strings.overview_compare_to_label }}</label
                >
                <select
                    id="comparisonPeriod"
                    v-model="selectedComparisonPeriod"
                    class="focus:ring-opacity-50 rounded-md border border-solid border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:ring focus:ring-blue-200">
                    <option value="sameQuarterLastYear">
                        {{ strings.overview_compare_same_quarter_last_year }}
                    </option>
                    <option value="previousQuarter">
                        {{ strings.overview_compare_previous_quarter }}
                    </option>
                </select>
            </div>
            <!-- <fieldset>
                <legend class="">Compare to:</legend>
                <div class="flex items-center space-x-4">
                    <div class="flex">
                        <input
                            type="radio"
                            id="sameQuarterLastYear"
                            name="comparisonPeriod"
                            value="sameQuarterLastYear"
                            v-model="selectedComparisonPeriod" />
                        <label
                            for="sameQuarterLastYear"
                            class="flex cursor-pointer items-center rounded-md border border-gray-300 py-1 pl-1 text-sm peer-data-[state=checked]:bg-blue-600 peer-data-[state=checked]:text-white">
                            Same quarter last year
                        </label>
                    </div>
                    <div class="flex">
                        <input
                            type="radio"
                            id="previousQuarter"
                            name="comparisonPeriod"
                            value="previousQuarter"
                            v-model="selectedComparisonPeriod" />
                        <label
                            for="previousQuarter"
                            class="flex cursor-pointer items-center rounded-md border border-gray-300 py-1 pl-1 text-sm peer-data-[state=checked]:bg-blue-600 peer-data-[state=checked]:text-white">
                            Previous quarter
                        </label>
                    </div>
                </div>
            </fieldset> -->
            <!-- <span>[Show positions/FTEs]</span> -->
        </div>
        <div
            class="col-span-full grid grid-cols-4 space-y-8 rounded-sm border border-solid border-gray-300 p-4">
            <div class="col-span-full text-center">
                <h2 class="mb-8 text-xl text-balance">
                    {{ strings.overview_size_heading }}
                </h2>
                <h3 class="text-sm font-medium">
                    {{ strings.overview_all_positions_label }}
                </h3>
                <p
                    class="font-bold"
                    :class="{
                        'text-red-800': allDepartmentsAbsoluteDiff < 0,
                        'text-green-800': allDepartmentsAbsoluteDiff > 0,
                    }">
                    {{ numberFormatter(allDepartmentsAbsoluteDiff) }}
                    ({{ numberFormatter(allDepartmentsRelativeDiff) }}%)
                    <span v-if="allDepartmentsAbsoluteDiff > 0">↑</span>
                    <span v-else-if="allDepartmentsAbsoluteDiff < 0">↓</span>
                    <span v-else>-</span>
                </p>
            </div>
            <div class="col-span-full text-center md:col-span-2 xl:col-span-1">
                <h3 class="text-sm font-medium">
                    {{ strings.indeterminate_label }}
                </h3>
                <p
                    class="text-lg font-light"
                    :class="{
                        'text-red-800': indeterminateAbsoluteDiff < 0,
                        'text-green-800': indeterminateAbsoluteDiff > 0,
                    }">
                    {{ numberFormatter(indeterminateAbsoluteDiff) }}
                    ({{ numberFormatter(indeterminateRelativeDiff) }}%)
                    <span v-if="indeterminateAbsoluteDiff > 0">↑</span>
                    <span v-else-if="indeterminateAbsoluteDiff < 0">↓</span>
                    <span v-else>-</span>
                </p>
            </div>
            <div class="col-span-full text-center md:col-span-2 xl:col-span-1">
                <h3 class="text-sm font-medium">{{ strings.term_label }}</h3>
                <p
                    class="text-lg font-light"
                    :class="{
                        'text-red-800': termAbsoluteDiff < 0,
                        'text-green-800': termAbsoluteDiff > 0,
                    }">
                    {{ numberFormatter(termAbsoluteDiff) }} ({{
                        numberFormatter(termRelativeDiff)
                    }}%)
                    <span v-if="termAbsoluteDiff > 0">↑</span>
                    <span v-else-if="termAbsoluteDiff < 0">↓</span>
                    <span v-else>-</span>
                </p>
            </div>
            <div class="col-span-full text-center md:col-span-2 xl:col-span-1">
                <h3 class="text-sm font-medium">{{ strings.student_label }}</h3>
                <p
                    class="text-lg font-light"
                    :class="{
                        'text-red-800': studentAbsoluteDiff < 0,
                        'text-green-800': studentAbsoluteDiff > 0,
                    }">
                    {{ numberFormatter(studentAbsoluteDiff) }} ({{
                        numberFormatter(studentRelativeDiff)
                    }}%)
                    <span v-if="studentAbsoluteDiff > 0">↑</span>
                    <span v-else-if="studentAbsoluteDiff < 0">↓</span>
                    <span v-else>-</span>
                </p>
            </div>
            <div class="col-span-full text-center md:col-span-2 xl:col-span-1">
                <h3 class="text-sm font-medium">{{ strings.casual_label }}</h3>
                <p
                    class="text-lg font-light"
                    :class="{
                        'text-red-800': casualAbsoluteDiff < 0,
                        'text-green-800': casualAbsoluteDiff > 0,
                    }">
                    {{ numberFormatter(casualAbsoluteDiff) }} ({{
                        numberFormatter(casualRelativeDiff)
                    }}%)
                    <span v-if="casualAbsoluteDiff > 0">↑</span>
                    <span v-else-if="casualAbsoluteDiff < 0">↓</span>
                    <span v-else>-</span>
                </p>
            </div>
        </div>
        <div
            class="col-span-full flex flex-col space-y-4 rounded-sm border border-solid border-gray-300 p-4 md:col-span-2">
            <h2 class="mb-8 text-center text-xl text-balance">
                {{ strings.overview_largest_increase_by_department }}
            </h2>
            <ol class="space-y-2">
                <li
                    v-for="department in topThreeDepartmentsIncrease"
                    :key="department.department_id">
                    <div class="text-sm font-medium">
                        {{ displayDepartmentName(department) }}
                    </div>
                    <div
                        class="font-light"
                        :class="{
                            'text-red-800': department.absoluteDiff < 0,
                            'text-green-800': department.absoluteDiff > 0,
                        }">
                        <span
                            >{{ numberFormatter(department.absoluteDiff) }}
                        </span>
                        ({{ numberFormatter(department.relativeDiff) }}%)
                        <span v-if="department.absoluteDiff > 0">↑</span>
                        <span v-else-if="department.absoluteDiff < 0">↓</span>
                        <span v-else>-</span>
                    </div>
                </li>
            </ol>
        </div>
        <div
            class="col-span-full flex flex-col space-y-4 rounded-sm border border-solid border-gray-300 p-4 md:col-span-2">
            <h2 class="mb-8 text-center text-xl text-balance">
                {{ strings.overview_largest_decrease_by_department }}
            </h2>
            <ol class="space-y-2">
                <li
                    v-for="department in topThreeDepartmentsDecrease"
                    :key="department.department_id">
                    <div class="text-sm font-medium">
                        {{ displayDepartmentName(department) }}
                    </div>
                    <div
                        class="font-bold font-light"
                        :class="{
                            'text-red-800': department.absoluteDiff < 0,
                            'text-green-800': department.absoluteDiff > 0,
                        }">
                        <span
                            >{{ numberFormatter(department.absoluteDiff) }}
                        </span>
                        ({{ numberFormatter(department.relativeDiff) }}%)
                        <span v-if="department.absoluteDiff > 0">↑</span>
                        <span v-else-if="department.absoluteDiff < 0">↓</span>
                        <span v-else>-</span>
                    </div>
                </li>
            </ol>
        </div>
    </div>
    <div v-else>
        <LoadingIndicator class="size-6" />
    </div>
</template>

<script>
    import LoadingIndicator from "../LoadingIndicator.vue";
    import numberFormatter from "../../mixins/numberFormatter.js";

    import { storeToRefs } from "pinia";

    import useLocalizationsStore from "../../stores/localizations.js";

    import usePayloadsStore from "../../stores/payloads.js";

    export default {
        emits: ["update:comparisonPeriod"],
        components: {
            LoadingIndicator,
        },
        props: {
            comparisonPeriod: {
                type: String,
                default: "sameQuarterLastYear",
            },
        },
        data() {
            return {
                data: null,
                isLoading: false,
                selectedComparisonPeriod: this.comparisonPeriod,
            };
        },
        computed: {
            allDepartmentsAbsoluteDiff() {
                return this.data?.quarterly?.comparisons[
                    this.selectedComparisonPeriod
                ]?.general?.absoluteDiff;
            },
            allDepartmentsRelativeDiff() {
                return this.data?.quarterly?.comparisons[
                    this.selectedComparisonPeriod
                ]?.general?.relativeDiff;
            },
            indeterminateAbsoluteDiff() {
                return this.data?.quarterly?.comparisons[
                    this.selectedComparisonPeriod
                ]?.general?.tenures?.indeterminate?.absoluteDiff;
            },
            indeterminateRelativeDiff() {
                return this.data?.quarterly?.comparisons[
                    this.selectedComparisonPeriod
                ]?.general?.tenures?.indeterminate?.relativeDiff;
            },
            termAbsoluteDiff() {
                return this.data?.quarterly?.comparisons[
                    this.selectedComparisonPeriod
                ]?.general?.tenures?.term?.absoluteDiff;
            },
            termRelativeDiff() {
                return this.data?.quarterly?.comparisons[
                    this.selectedComparisonPeriod
                ]?.general?.tenures?.term?.relativeDiff;
            },
            studentAbsoluteDiff() {
                return this.data?.quarterly?.comparisons[
                    this.selectedComparisonPeriod
                ]?.general?.tenures?.student?.absoluteDiff;
            },
            studentRelativeDiff() {
                return this.data?.quarterly?.comparisons[
                    this.selectedComparisonPeriod
                ]?.general?.tenures?.student?.relativeDiff;
            },
            casualAbsoluteDiff() {
                return this.data?.quarterly?.comparisons[
                    this.selectedComparisonPeriod
                ]?.general?.tenures?.casual?.absoluteDiff;
            },
            casualRelativeDiff() {
                return this.data?.quarterly?.comparisons[
                    this.selectedComparisonPeriod
                ]?.general?.tenures?.casual?.relativeDiff;
            },
            topThreeDepartmentsIncrease() {
                return this.data?.quarterly?.comparisons[
                    this.selectedComparisonPeriod
                ]?.departments?.top_absolute_gains;
            },
            topThreeDepartmentsDecrease() {
                return this.data?.quarterly?.comparisons[
                    this.selectedComparisonPeriod
                ]?.departments?.top_absolute_declines;
            },
            strings() {
                const localizationsStore = useLocalizationsStore();

                return localizationsStore.strings;
            },
            language() {
                const localizationsStore = useLocalizationsStore();

                return localizationsStore.language;
            },
        },
        methods: {
            displayDepartmentName(department) {
                return this.language === "fr"
                    ? department.department_name_fr
                    : department.department_name_en;
            },
        },
        watch: {
            comparisonPeriod(newValue) {
                this.selectedComparisonPeriod = newValue;
            },
            selectedComparisonPeriod(newValue) {
                this.$emit("update:comparisonPeriod", newValue);
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
        },
    };
</script>
