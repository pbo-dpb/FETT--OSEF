<template>
    <div class="flex flex-col gap-1">
        <span
            id="preferred-metric-label"
            class="font-semibold">
            {{ strings.preferred_comparison_period_label }}
        </span>
        <ToggleGroupRoot
            v-model="selectedComparisonPeriod"
            type="single"
            aria-labelledby="preferred-metric-label"
            class="flex flex-row gap-2"
            required>
            <ToggleGroupItem
                value="sameQuarterLastYear"
                :class="toggleGroupItemClasses"
                :disabled="selectedComparisonPeriod === 'sameQuarterLastYear'">
                {{ strings.overview_compare_same_quarter_last_year }}
            </ToggleGroupItem>
            <ToggleGroupItem
                value="previousQuarter"
                :class="toggleGroupItemClasses"
                :disabled="selectedComparisonPeriod === 'previousQuarter'">
                {{ strings.overview_compare_previous_quarter }}
            </ToggleGroupItem>
        </ToggleGroupRoot>
    </div>
</template>

<script setup>
    import { ToggleGroupItem, ToggleGroupRoot } from "reka-ui";
    import { storeToRefs } from "pinia";
    import { toggleGroupItemClasses } from "./pickerStyles.js";
    import useLocalizationsStore from "@/stores/localizations.js";

    const localizationsStore = useLocalizationsStore();
    const { strings } = storeToRefs(localizationsStore);

    import useSettingsStore from "@/stores/settings.js";
    const settingsStore = useSettingsStore();
    const { selectedComparisonPeriod } = storeToRefs(settingsStore);
</script>
