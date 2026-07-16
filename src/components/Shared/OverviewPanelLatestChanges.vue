<template>
    <OverviewPanelShell
        :header="header"
        :metric="metric">
        <div class="grid grid-cols-4 space-y-8">
            <div class="col-span-full text-center">
                <h4 class="font-semibold">
                    {{ strings[overviewAllLabelKey] }}
                </h4>
                <p class="text-3xl font-bold">
                    {{ useNumberFormatter(allDepartmentsAbsoluteDiff) }}
                    ({{
                        useNumberFormatter(allDepartmentsRelativeDiff, true)
                    }}%)
                    <TrendIndicator :datapoint="allDepartmentsAbsoluteDiff" />
                </p>
            </div>
            <div class="3xl:col-span-1 col-span-full text-center lg:col-span-2">
                <h4 class="font-semibold">
                    {{ strings.indeterminate_label }}
                </h4>
                <p class="text-xl">
                    {{ useNumberFormatter(indeterminateAbsoluteDiff) }}
                    ({{ useNumberFormatter(indeterminateRelativeDiff, true) }}%)
                    <TrendIndicator :datapoint="indeterminateAbsoluteDiff" />
                </p>
            </div>
            <div class="3xl:col-span-1 col-span-full text-center lg:col-span-2">
                <h4 class="font-semibold">{{ strings.term_label }}</h4>
                <p class="text-xl">
                    {{ useNumberFormatter(termAbsoluteDiff) }}
                    ({{ useNumberFormatter(termRelativeDiff, true) }}%)
                    <TrendIndicator :datapoint="termAbsoluteDiff" />
                </p>
            </div>
            <div class="3xl:col-span-1 col-span-full text-center lg:col-span-2">
                <h4 class="font-semibold">{{ strings.casual_label }}</h4>
                <p class="text-xl">
                    {{ useNumberFormatter(casualAbsoluteDiff) }}
                    ({{ useNumberFormatter(casualRelativeDiff, true) }}%)
                    <TrendIndicator :datapoint="casualAbsoluteDiff" />
                </p>
            </div>
            <div class="3xl:col-span-1 col-span-full text-center lg:col-span-2">
                <h4 class="font-semibold">{{ strings.student_label }}</h4>
                <p class="text-xl">
                    {{ useNumberFormatter(studentAbsoluteDiff) }}
                    ({{ useNumberFormatter(studentRelativeDiff, true) }}%)
                    <TrendIndicator :datapoint="studentAbsoluteDiff" />
                </p>
            </div>
        </div>
    </OverviewPanelShell>
</template>

<script setup>
    import { computed } from "vue";
    import { storeToRefs } from "pinia";

    import usePayloadsStore from "@/stores/payloads.js";
    import useSettingsStore from "@/stores/settings.js";
    import useLocalizationsStore from "@/stores/localizations.js";

    import { useNumberFormatter } from "@/composables/useNumberFormatter.js";

    import OverviewPanelShell from "./OverviewPanelShell.vue";
    import TrendIndicator from "./TrendIndicator.vue";

    const payloadStore = usePayloadsStore();
    const settingsStore = useSettingsStore();
    const localizationsStore = useLocalizationsStore();

    const { overview } = storeToRefs(payloadStore);
    const { preferredMetric } = storeToRefs(settingsStore);
    const { strings } = storeToRefs(localizationsStore);

    defineProps(["header", "metric"]);

    const overviewAllLabelKey = computed(() => {
        return preferredMetric.value === "pop"
            ? "overview_all_headcount_label"
            : "overview_all_positions_label";
    });

    const comparisonData = computed(() => {
        return overview.value?.quarterly?.comparisons?.[
            settingsStore.selectedComparisonPeriod
        ];
    });

    const generalComparison = computed(() => {
        if (preferredMetric.value === "pop") {
            return comparisonData.value?.generalExcludingCombinedPop;
        }

        return comparisonData.value?.generalExcludingCombined;
    });

    const allDepartmentsAbsoluteDiff = computed(
        () => generalComparison.value?.absoluteDiff,
    );

    const allDepartmentsRelativeDiff = computed(
        () => generalComparison.value?.relativeDiff,
    );

    const indeterminateAbsoluteDiff = computed(
        () => generalComparison.value?.tenures?.indeterminate?.absoluteDiff,
    );

    const indeterminateRelativeDiff = computed(
        () => generalComparison.value?.tenures?.indeterminate?.relativeDiff,
    );

    const termAbsoluteDiff = computed(
        () => generalComparison.value?.tenures?.term?.absoluteDiff,
    );

    const termRelativeDiff = computed(
        () => generalComparison.value?.tenures?.term?.relativeDiff,
    );

    const casualAbsoluteDiff = computed(
        () => generalComparison.value?.tenures?.casual?.absoluteDiff,
    );

    const casualRelativeDiff = computed(
        () => generalComparison.value?.tenures?.casual?.relativeDiff,
    );

    const studentAbsoluteDiff = computed(
        () => generalComparison.value?.tenures?.student?.absoluteDiff,
    );

    const studentRelativeDiff = computed(
        () => generalComparison.value?.tenures?.student?.relativeDiff,
    );
</script>
