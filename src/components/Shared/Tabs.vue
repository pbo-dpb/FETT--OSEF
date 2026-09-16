<template>
    <div class="md:hidden">
        <label
            for="tab-select"
            class="sr-only">
            {{ strings.tab_navigation_aria_label }}
        </label>
        <div class="relative">
            <select
                id="tab-select"
                :aria-label="strings.tab_navigation_aria_label"
                class="w-full rounded-sm border border-solid border-gray-300 bg-white p-2 pr-10 text-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-700 focus-visible:outline-solid"
                :value="selectedTabName"
                @change="onMobileTabChange">
                <option
                    v-for="tab in tabs"
                    :key="tab.to.name"
                    :value="tab.to.name">
                    {{ tab.label }}
                </option>
            </select>
        </div>
    </div>
    <nav
        :aria-label="strings.tab_navigation_aria_label"
        class="hidden flex-row gap-2 rounded-sm bg-gray-100 p-1 md:flex">
        <RouterLink
            v-for="tab in tabs"
            :key="tab.to.name"
            :to="tab.to"
            :class="[
                'tab-focus rounded-sm px-4 py-2 font-semibold',
                tab.selected ? 'bg-primary text-white' : 'text-gray-600',
            ]"
            :aria-current="tab.selected ? 'page' : undefined">
            {{ tab.label }}
        </RouterLink>
    </nav>
</template>
<script setup>
    import { computed } from "vue";

    import { storeToRefs } from "pinia";

    import useLocalizationsStore from "@/stores/localizations.js";
    const localizationsStore = useLocalizationsStore();
    const { strings } = storeToRefs(localizationsStore);

    import useSettingsStore from "@/stores/settings.js";
    const settingsStore = useSettingsStore();
    const { previouslySelectedDepartmentIds, showAllDepartments } =
        storeToRefs(settingsStore);

    import { useRoute, useRouter } from "vue-router";
    const route = useRoute();
    const router = useRouter();

    const tabs = computed(() => {
        const departmentsQuery = showAllDepartments.value
            ? { cumulative: "1" }
            : {};

        const departmentsParams =
            route.name === "departments"
                ? {
                      departments: Array.isArray(route.params.departments)
                          ? route.params.departments.filter(Boolean)
                          : route.params.departments
                            ? [route.params.departments].filter(Boolean)
                            : [],
                  }
                : {
                      departments: previouslySelectedDepartmentIds.value,
                  };

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
                    params: departmentsParams,
                    query:
                        route.name === "departments"
                            ? route.query
                            : departmentsQuery,
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

    const selectedTabName = computed(() => {
        const current = tabs.value.find((tab) => tab.selected);
        return current?.to.name ?? tabs.value[0]?.to.name;
    });

    const onMobileTabChange = (event) => {
        const selectedName = event.target.value;
        const selectedTab = tabs.value.find(
            (tab) => tab.to.name === selectedName,
        );

        if (selectedTab) {
            router.push(selectedTab.to);
        }
    };
</script>
