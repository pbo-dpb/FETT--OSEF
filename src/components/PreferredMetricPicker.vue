<template>
    <ToggleGroupRoot
        v-model="preferredMetric"
        type="single"
        class="flex flex-row gap-2"
        required>
        <ToggleGroupItem
            value="fte"
            :class="toggleGroupItemClasses"
            :disabled="preferredMetric === 'fte'">
            {{ strings.preferred_metric_fte }}
        </ToggleGroupItem>
        <ToggleGroupItem
            value="pop"
            :class="toggleGroupItemClasses"
            :disabled="preferredMetric === 'pop'">
            {{ strings.preferred_metric_headcount }}
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
    const { preferredMetric } = storeToRefs(settingsStore);
</script>
