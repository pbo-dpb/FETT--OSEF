<template>
    <div class="flex flex-col gap-1">
        <label
            for="preferred-tenure"
            class="cursor-pointer font-semibold"
            >{{ strings.preferred_tenure_label }}</label
        >
        <select
            id="preferred-tenure"
            class="cursor-pointer rounded-sm border border-solid border-gray-300 bg-white py-0.5 text-gray-700 focus-visible:outline-offset-4 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
            v-model="preferredTenure">
            <option value="indeterminate">
                {{ strings.dep_indeterminate }}
            </option>
            <option value="term">{{ strings.dep_term }}</option>
            <option value="casual">{{ strings.dep_casual }}</option>
            <option value="student">{{ strings.dep_student }}</option>
            <option value="combined">{{ strings.dep_combined }}</option>
        </select>
    </div>
</template>

<script setup>
    import { storeToRefs } from "pinia";

    import useSettingsStore from "@/stores/settings.js";
    const settingsStore = useSettingsStore();
    const { preferredTenure } = storeToRefs(settingsStore);

    import useLocalizationStore from "@/stores/localizations.js";
    const localizationsStore = useLocalizationStore();
    const { strings } = storeToRefs(localizationsStore);
</script>
