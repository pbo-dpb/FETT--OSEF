<template>
    <div class="flex flex-col gap-1">
        <span
            id="preferred-metric-label"
            class="font-semibold">
            {{ strings.preferred_timeframe_label }}
        </span>
        <ToggleGroupRoot
            v-model="preferredTimeframe"
            type="single"
            aria-labelledby="preferred-metric-label"
            class="flex flex-row gap-2">
            <ToggleGroupItem
                value="1Y"
                :class="toggleGroupItemClasses"
                :disabled="preferredTimeframe === '1Y'">
                {{ strings.preferred_timeframe_1y }}
            </ToggleGroupItem>
            <ToggleGroupItem
                value="3Y"
                :class="toggleGroupItemClasses"
                :disabled="preferredTimeframe === '3Y'">
                {{ strings.preferred_timeframe_3y }}
            </ToggleGroupItem>
            <ToggleGroupItem
                value="5Y"
                :class="toggleGroupItemClasses"
                :disabled="preferredTimeframe === '5Y'">
                {{ strings.preferred_timeframe_5y }}
            </ToggleGroupItem>
            <!-- <ToggleGroupItem
          value="10Y"
          :class="toggleGroupItemClasses"
          :disabled="preferredTimeframe === '10Y'"
        >
          {{ strings.preferred_timeframe_10y }}
        </ToggleGroupItem> -->
            <ToggleGroupItem
                value="MAX"
                :class="toggleGroupItemClasses"
                :disabled="preferredTimeframe === 'MAX'">
                {{ strings.preferred_timeframe_max }}
            </ToggleGroupItem>
        </ToggleGroupRoot>
    </div>
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
    const { preferredTimeframe } = storeToRefs(settingsStore);
</script>
