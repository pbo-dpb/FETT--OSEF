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
                        ? 'bg-primary text-white dark:bg-gray-100 dark:text-gray-700'
                        : 'border border-solid border-gray-300 bg-white dark:bg-gray-950',
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
                        ? 'bg-primary text-white dark:bg-gray-100 dark:text-gray-700'
                        : 'border border-solid border-gray-300 bg-white dark:bg-gray-950',
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
            <label
                for="cp-peakFederalEmployment"
                :class="[
                    ...toggleRadioBaseClasses,
                    selectedComparisonPeriod === 'peakFederalEmployment'
                        ? 'bg-primary text-white dark:bg-gray-100 dark:text-gray-700'
                        : 'border border-solid border-gray-300 bg-white dark:bg-gray-950',
                ]">
                <input
                    type="radio"
                    name="preferred_comparison_period"
                    id="cp-peakFederalEmployment"
                    value="peakFederalEmployment"
                    :checked="
                        selectedComparisonPeriod === 'peakFederalEmployment'
                    "
                    @change="selectedComparisonPeriod = 'peakFederalEmployment'"
                    class="sr-only" />
                {{ strings.overview_compare_peak_federal_employment }}
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
