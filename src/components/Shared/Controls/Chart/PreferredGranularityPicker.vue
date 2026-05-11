<template>
    <div class="flex flex-col gap-1">
        <span
            id="preferred-granularity-label"
            class="font-semibold">
            {{ strings.preferred_granularity_label }}
        </span>
        <ToggleGroupRoot
            v-model="preferredGranularity"
            type="single"
            aria-labelledby="preferred-granularity-label"
            class="flex flex-row flex-wrap gap-2"
            required>
            <ToggleGroupItem
                value="quarter"
                :class="toggleGroupItemClasses"
                :disabled="preferredGranularity === 'quarter'">
                {{ strings.preferred_granularity_quarter }}
            </ToggleGroupItem>
            <ToggleGroupItem
                value="fiscal_year"
                :class="toggleGroupItemClasses"
                :disabled="preferredGranularity === 'fiscal_year'">
                {{ strings.preferred_granularity_fiscal_year }}
            </ToggleGroupItem>
        </ToggleGroupRoot>
    </div>
</template>
<script setup>
    import { ToggleGroupItem, ToggleGroupRoot } from "reka-ui";
    import { storeToRefs } from "pinia";
    import { toggleGroupItemClasses } from "./pickerStyles.js";

    import useSettingsStore from "@/stores/settings.js";
    const settingsStore = useSettingsStore();
    const { preferredGranularity } = storeToRefs(settingsStore);

    import useLocalizationsStore from "@/stores/localizations.js";
    const localizationsStore = useLocalizationsStore();
    const { strings } = storeToRefs(localizationsStore);
</script>
