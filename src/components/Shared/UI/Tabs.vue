<template>
    <nav
        :aria-label="strings.tab_navigation_aria_label"
        class="flex flex-row space-x-4 border-b border-solid border-gray-300 select-none">
        <RouterLink
            v-for="tab in tabs"
            :key="tab.to.name"
            :to="tab.to"
            :class="[
                'tab-focus flex flex-row items-center gap-2 border-b-2 border-solid pb-2 font-semibold text-gray-700',
                tab.selected ? 'border-gray-600' : 'border-transparent',
            ]"
            :aria-selected="tab.selected.toString()">
            {{ tab.label }}
        </RouterLink>
    </nav>
</template>
<script setup>
    import { computed } from "vue";

    import { storeToRefs } from "pinia";

    import useLocalizationsStore from "@/stores/localizations.js";
    const localizationsStore = useLocalizationsStore();
    const { language, strings } = storeToRefs(localizationsStore);

    import useSettingsStore from "@/stores/settings.js";
    const settingsStore = useSettingsStore();
    const { previouslySelectedDepartmentIds } = storeToRefs(settingsStore);

    import { useRoute, useRouter } from "vue-router";
    const route = useRoute();

    const tabs = computed(() => {
        return [
            {
                label: strings.value.tab_navigation_overview_label,
                to: { name: "overview" },
                selected: route.name === "overview",
            },
            {
                label: strings.value.tab_navigation_composition_label,
                to: { name: "composition" },
                selected: route.name === "composition",
            },
            {
                label: strings.value.tab_navigation_departments_label,
                to: {
                    name: "departments",
                    params: {
                        departments: previouslySelectedDepartmentIds.value,
                    },
                },
                selected: route.name === "departments",
            },
            {
                label: strings.value.tab_navigation_notes_label,
                to: {
                    name: "notes",
                },
                selected: route.name === "notes",
            },
        ];
    });
</script>
