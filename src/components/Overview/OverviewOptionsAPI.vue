<template>
    <div
        v-if="data"
        class="grid grid-cols-4 gap-4">
        <div class="col-span-full flex justify-end gap-4">
            <fieldset>
                <legend class="sr-only">Comparison period</legend>
                <div class="flex items-center space-x-4">
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
                            Previous year
                        </label>
                    </div>
                </div>
            </fieldset>
            <!-- <span>[Show positions/FTEs] </span> -->
        </div>
        <div
            class="col-span-full grid grid-cols-4 space-y-8 rounded-sm border border-solid border-gray-300 p-4">
            <div class="col-span-full text-center">
                <h2 class="mb-8 text-xl text-balance">
                    Size of the federal public service
                </h2>
                <p class="font-bold">
                    {{
                        numberFormatter(
                            data.quarterly.comparisons[selectedComparisonPeriod]
                                .general.absoluteDiff,
                        )
                    }}
                    positions ({{
                        data.quarterly.comparisons[selectedComparisonPeriod]
                            .general.relativeDiff
                    }}%)
                </p>
                <h3 class="text-sm">All positions</h3>
            </div>
            <div class="col-span-full text-center md:col-span-2 lg:col-span-1">
                <p class="font-bold">-500 positions (1.92%)</p>
                <h3 class="text-sm">Indeterminates</h3>
            </div>
            <div class="col-span-full text-center md:col-span-2 lg:col-span-1">
                <p class="font-bold">+2,500 positions (3.50%)</p>
                <h3 class="text-sm">Term</h3>
            </div>
            <div class="col-span-full text-center md:col-span-2 lg:col-span-1">
                <p class="font-bold">+375 positions (7.25%)</p>
                <h3 class="text-sm">Student</h3>
            </div>
            <div class="col-span-full text-center md:col-span-2 lg:col-span-1">
                <p class="font-bold">-140 positions (3.52%)</p>
                <h3 class="text-sm">Casuals</h3>
            </div>
        </div>
        <div
            class="col-span-full flex flex-col space-y-4 rounded-sm border border-solid border-gray-300 p-4 md:col-span-2">
            <h2 class="mb-8 text-center text-xl text-balance">
                Largest increase by department
            </h2>
            <ol class="space-y-2">
                <li>
                    100 positions
                    <div class="text-sm">Shared Services Canada</div>
                </li>
                <li>
                    60 positions
                    <div class="text-sm">
                        Secretariat of the National Security and Intelligence
                        Committee of Parliamentarians
                    </div>
                </li>
                <li>
                    25 positions
                    <div class="text-sm">Indian Oil and Gas Canada</div>
                </li>
            </ol>
        </div>
        <div
            class="col-span-full flex flex-col space-y-4 rounded-sm border border-solid border-gray-300 p-4 md:col-span-2">
            <h2 class="mb-8 text-center text-xl text-balance">
                Largest decrease by department
            </h2>
            <ol class="space-y-2">
                <li>
                    100 positions
                    <div class="text-sm text-balance">
                        The Correctional Investigator Canada
                    </div>
                </li>
                <li>
                    60 positions
                    <div class="text-sm text-balance">
                        Federal Economic Development Agency for Northern Ontario
                    </div>
                </li>
                <li>
                    25 positions
                    <div class="text-sm text-balance">
                        National Security Intelligence and Review Agency
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

            console.log(JSON.parse(JSON.stringify(this.data)));
        },
    };
</script>
