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
                    v-for="tab in mobileTabs"
                    :key="tab.to.name"
                    :value="tab.to.name">
                    {{ tab.label }}
                </option>
            </select>
        </div>
        <div class="mt-3">
            <a
                :href="downloadLink.href"
                class="tab-focus font-semibold text-gray-700 underline-offset-2 hover:underline">
                {{ downloadLink.label }}
            </a>
        </div>
    </div>
    <nav
        :aria-label="strings.tab_navigation_aria_label"
        class="hidden rounded-sm md:block">
        <div class="grid grid-cols-3 gap-2">
            <RouterLink
                v-for="tab in primaryTabs"
                :key="tab.to.name"
                :to="tab.to"
                :class="[
                    'tab-focus w-full rounded-sm px-4 py-8 text-center text-xl font-semibold',
                    tab.selected
                        ? 'bg-primary text-white'
                        : 'border border-solid border-gray-300 text-gray-600',
                ]"
                :aria-current="tab.selected ? 'page' : undefined">
                {{ tab.label }}
            </RouterLink>
        </div>
        <div class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 px-1">
            <RouterLink
                :to="notesLink.to"
                class="tab-focus font-semibold text-gray-700 underline-offset-2 hover:underline"
                :aria-current="notesLink.selected ? 'page' : undefined">
                {{ notesLink.label }}
            </RouterLink>
            <a
                :href="downloadLink.href"
                class="tab-focus font-semibold text-gray-700 underline-offset-2 hover:underline">
                {{ downloadLink.label }}
            </a>
        </div>
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

    const primaryTabs = computed(() => {
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
        ];
    });

    const notesLink = computed(() => ({
        label: strings.value.tab_navigation_notes_label,
        to: {
            name: "notes",
        },
        selected: route.name === "notes",
    }));

    const downloadLink = computed(() => ({
        label: strings.value.overview_download_button,
        href: "./FETT_publicdata.xlsx",
    }));

    const mobileTabs = computed(() => [
        ...primaryTabs.value,
        {
            label: notesLink.value.label,
            to: notesLink.value.to,
            selected: notesLink.value.selected,
        },
    ]);

    const selectedTabName = computed(() => {
        const current = mobileTabs.value.find((tab) => tab.selected);

        return (
            current?.to.name ??
            primaryTabs.value.find((tab) => tab.to.name === "overview")?.to
                .name ??
            mobileTabs.value[0]?.to.name
        );
    });

    const onMobileTabChange = (event) => {
        const selectedName = event.target.value;
        const selectedTab = mobileTabs.value.find(
            (tab) => tab.to.name === selectedName,
        );

        if (selectedTab) {
            router.push(selectedTab.to);
        }
    };
</script>
