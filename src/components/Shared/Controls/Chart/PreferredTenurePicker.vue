<template>
    <div class="flex flex-col gap-1">
        <label
            for="preferred-tenure"
            class="font-semibold"
            >{{ strings.preferred_tenure_label }}</label
        >
        <select
            id="preferred-tenure"
            class="rounded-sm border border-solid border-gray-300 py-0.5"
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
    import useLocalizationStore from "@/stores/localizations.js";
    import useSettingsStore from "@/stores/settings.js";

    const localizationsStore = useLocalizationStore();
    const { strings } = storeToRefs(localizationsStore);

    const settingsStore = useSettingsStore();
    const { preferredTenure } = storeToRefs(settingsStore);
</script>
