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
            <div class="3xl:col-span-1 col-span-full text-center lg:col-span-2">
                <h4 class="font-semibold">
                    {{ strings.indeterminate_label }}
                </h4>
                <p class="text-xl">
                    {{ useNumberFormatter(indeterminateLatestNumber) }}
                </p>
            </div>
            <div class="3xl:col-span-1 col-span-full text-center lg:col-span-2">
                <h4 class="font-semibold">{{ strings.term_label }}</h4>
                <p class="text-xl">
                    {{ useNumberFormatter(termLatestNumber) }}
                </p>
            </div>
            <div class="3xl:col-span-1 col-span-full text-center lg:col-span-2">
                <h4 class="font-semibold">{{ strings.casual_label }}</h4>
                <p class="text-xl">
                    {{ useNumberFormatter(casualLatestNumber) }}
                </p>
            </div>
            <div class="3xl:col-span-1 col-span-full text-center lg:col-span-2">
                <h4 class="font-semibold">{{ strings.student_label }}</h4>
                <p class="text-xl">
                    {{ useNumberFormatter(studentLatestNumber) }}
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

    const indeterminateLatestNumber = computed(
        () => generalComparison.value?.tenures?.indeterminate?.to,
    );

    const termLatestNumber = computed(
        () => generalComparison.value?.tenures?.term?.to,
    );

    const studentLatestNumber = computed(
        () => generalComparison.value?.tenures?.student?.to,
    );

    const casualLatestNumber = computed(
        () => generalComparison.value?.tenures?.casual?.to,
    );
</script>
