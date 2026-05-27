<template>
    <div class="flex flex-col gap-1">
        <span
            id="preferred-granularity-label"
            class="font-semibold">
            {{ strings.preferred_granularity_label }}
        </span>
        <div class="flex flex-row flex-wrap gap-2">
            <label
                for="gran-quarter"
                :class="[
                    ...toggleRadioBaseClasses,
                    preferredGranularity === 'quarter'
                        ? 'bg-primary text-white dark:bg-gray-100 dark:text-gray-700'
                        : 'border border-solid border-gray-300 bg-white dark:bg-gray-950',
                ]">
                <input
                    type="radio"
                    name="preferred_granularity"
                    id="gran-quarter"
                    value="quarter"
                    :checked="preferredGranularity === 'quarter'"
                    @change="preferredGranularity = 'quarter'"
                    class="sr-only" />
                {{ strings.preferred_granularity_quarter }}
            </label>
            <label
                for="gran-fiscal_year"
                :class="[
                    ...toggleRadioBaseClasses,
                    preferredGranularity === 'fiscal_year'
                        ? 'bg-primary text-white dark:bg-gray-100 dark:text-gray-700'
                        : 'border border-solid border-gray-300 bg-white dark:bg-gray-950',
                ]">
                <input
                    type="radio"
                    name="preferred_granularity"
                    id="gran-fiscal_year"
                    value="fiscal_year"
                    :checked="preferredGranularity === 'fiscal_year'"
                    @change="preferredGranularity = 'fiscal_year'"
                    class="sr-only" />
                {{ strings.preferred_granularity_fiscal_year }}
            </label>
        </div>
    </div>
</template>
<script setup>
    import { storeToRefs } from "pinia";
    import { toggleRadioBaseClasses } from "./toggleRadioClasses.js";

    import useSettingsStore from "@/stores/settings.js";
    const settingsStore = useSettingsStore();
    const { preferredGranularity } = storeToRefs(settingsStore);

    import useLocalizationsStore from "@/stores/localizations.js";
    const localizationsStore = useLocalizationsStore();
    const { strings } = storeToRefs(localizationsStore);
</script>
