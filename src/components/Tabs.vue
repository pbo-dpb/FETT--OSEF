<template>
    <nav :aria-label="strings.tab_navigation_aria_label"
        class="border-b border-gray-300 border-solid flex flex-row space-x-4">

        <RouterLink v-for="tab in tabs" :to="tab.to" :class="{
            'pb-2 border-b-2  border-solid flex flex-row gap-2 items-center  font-medium ': true,
            'border-transparent hover:border-gray-300 text-gray-500 hover:text-gray-600': !tab.selected,
            'text-slate-800 border-slate-600  -mb-0.25 border-b-3 pb-2.25': tab.selected
        }" :aria-selected="tab.selected.toString()">
            {{ tab.label }}
        </RouterLink>

    </nav>
</template>
<script setup>
import { computed } from 'vue'

import { storeToRefs } from 'pinia'
import useLocalizationsStore from '../stores/localizations.js'
const localizationsStore = useLocalizationsStore()
const { language, strings } = storeToRefs(localizationsStore)

import useSettingsStore from '../stores/settings.js'
const settingsStore = useSettingsStore()
const { previouslySelectedDepartmentIds } = storeToRefs(settingsStore)

import { useRoute, useRouter } from 'vue-router'
const route = useRoute()

const tabs = computed(() => {

    return [
        {
            label: strings.value.tab_navigation_overview_label,
            to: { name: 'overview' },
            selected: route.name === 'overview'
        },
        {
            label: strings.value.tab_navigation_composition_label,
            to: { name: 'composition' },
            selected: route.name === 'composition'
        },
        {
            label: strings.value.tab_navigation_departments_label,
            to: { name: 'departments', params: { departments: previouslySelectedDepartmentIds.value } },
            selected: route.name === 'departments'
        }
    ]
})

</script>