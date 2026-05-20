<template>
    <div class="flex flex-col gap-1">
        <span
            id="preferred-metric-label"
            class="font-semibold">
            {{ strings.preferred_comparison_period_label }}
        </span>
        <div class="flex flex-row flex-wrap gap-2">
            <label
                for="cp-sameQuarterLastYear"
                :class="[
                    ...toggleRadioBaseClasses,
                    selectedComparisonPeriod === 'sameQuarterLastYear'
                        ? 'bg-gray-900 text-white'
                        : 'border border-solid border-gray-300 bg-white',
                ]">
                <input
                    type="radio"
                    name="preferred_comparison_period"
                    id="cp-sameQuarterLastYear"
                    value="sameQuarterLastYear"
                    :checked="
                        selectedComparisonPeriod === 'sameQuarterLastYear'
                    "
                    @change="selectedComparisonPeriod = 'sameQuarterLastYear'"
                    class="sr-only" />
                {{ strings.overview_compare_same_quarter_last_year }}
            </label>
            <label
                for="cp-previousQuarter"
                :class="[
                    ...toggleRadioBaseClasses,
                    selectedComparisonPeriod === 'previousQuarter'
                        ? 'bg-gray-900 text-white'
                        : 'border border-solid border-gray-300 bg-white',
                ]">
                <input
                    type="radio"
                    name="preferred_comparison_period"
                    id="cp-previousQuarter"
                    value="previousQuarter"
                    :checked="selectedComparisonPeriod === 'previousQuarter'"
                    @change="selectedComparisonPeriod = 'previousQuarter'"
                    class="sr-only" />
                {{ strings.overview_compare_previous_quarter }}
            </label>
        </div>
    </div>
</template>

<script setup>
    import { storeToRefs } from "pinia";
    import { toggleRadioBaseClasses } from "./toggleRadioClasses.js";

    import useSettingsStore from "@/stores/settings.js";
    const settingsStore = useSettingsStore();
    const { selectedComparisonPeriod } = storeToRefs(settingsStore);

    import useLocalizationsStore from "@/stores/localizations.js";
    const localizationsStore = useLocalizationsStore();
    const { strings } = storeToRefs(localizationsStore);
</script>
