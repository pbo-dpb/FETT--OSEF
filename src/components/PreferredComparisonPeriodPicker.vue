<template>
    <ToggleGroupRoot
        v-model="selectedComparisonPeriod"
        type="single"
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
</template>

<script setup>
    import { ToggleGroupItem, ToggleGroupRoot } from "reka-ui";
    import { storeToRefs } from "pinia";
    import { toggleGroupItemClasses } from "./pickerStyles.js";
    import useLocalizationsStore from "../stores/localizations.js";

    const localizationsStore = useLocalizationsStore();
    const { strings } = storeToRefs(localizationsStore);

    import useSettingsStore from "../stores/settings.js";
    const settingsStore = useSettingsStore();
    const { selectedComparisonPeriod } = storeToRefs(settingsStore);
</script>
