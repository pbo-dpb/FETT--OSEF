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
            <div
                v-for="tenure in tenures"
                :key="tenure.key"
                class="3xl:col-span-1 col-span-full text-center lg:col-span-2">
                <h4 class="font-semibold">
                    {{ strings[tenure.label] }}
                </h4>
                <p class="text-xl">
                    {{
                        useNumberFormatter(
                            generalComparison.tenures?.[tenure.key]
                                .absoluteDiff,
                        )
                    }}
                    ({{
                        useNumberFormatter(
                            generalComparison.tenures?.[tenure.key]
                                .relativeDiff,
                            true,
                        )
                    }}%)
                    <TrendIndicator
                        :datapoint="
                            generalComparison.tenures?.[tenure.key].absoluteDiff
                        " />
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
    import { TrendIndicator } from "@/components/Shared";

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

    const tenures = [
        { key: "indeterminate", label: "indeterminate_label" },
        { key: "term", label: "term_label" },
        { key: "student", label: "student_label" },
        { key: "casual", label: "casual_label" },
    ];
</script>
