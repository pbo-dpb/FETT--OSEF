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
                    {{ useNumberFormatter(allDepartmentsLatestNumber) }}
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
                            generalComparison.tenures?.[tenure.key]?.to,
                        )
                    }}
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

    const usePayloadStore = usePayloadsStore();
    const settingsStore = useSettingsStore();
    const localizationsStore = useLocalizationsStore();

    const { overview } = storeToRefs(usePayloadStore);
    const { preferredMetric } = storeToRefs(settingsStore);
    const { strings } = storeToRefs(localizationsStore);

    defineProps(["header", "metric"]);

    const overviewAllLabelKey = computed(() => {
        return preferredMetric.value === "pop"
            ? "overview_all_headcount_label"
            : "overview_all_positions_label";
    });

    const comparisonData = computed(() => {
        console.log(overview.value);

        return overview.value?.quarterly?.comparisons?.[
            settingsStore.selectedComparisonPeriod
        ];
    });

    const generalComparison = computed(() => {
        return preferredMetric.value === "pop"
            ? comparisonData.value?.generalExcludingCombinedPop
            : comparisonData.value?.generalExcludingCombined;
    });

    const allDepartmentsLatestNumber = computed(
        () => generalComparison.value?.to,
    );

    const tenures = [
        { key: "indeterminate", label: "indeterminate_label" },
        { key: "term", label: "term_label" },
        { key: "student", label: "student_label" },
        { key: "casual", label: "casual_label" },
    ];
</script>
