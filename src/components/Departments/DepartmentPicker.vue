<template>
    <ScrollAreaRoot
        class="max-h-128 relative  overflow-hidden border-2  border-solid rounded-lg transition-colors duration-150"
        :class="{
            'border-sky-100': currentlySelectedDepartmentIds.length, 'border-sky-300': !currentlySelectedDepartmentIds.length
        }" style="--scrollbar-size: 10px">
        <div class="absolute top-0 z-10 w-full h-6 bg-gradient-to-t from-transparent to-white" />
        <ScrollAreaViewport class="w-full h-full rounded">
            <div class="p-4">
                <div><input type="search" v-model="query"
                        class="w-full mb-4 px-2 py-1 border border-slate-300 border-solid rounded"
                        :placeholder="strings.search_departments_placeholder" /></div>
                <component :is="department.route ? 'RouterLink' : 'span'" :to="department.route"
                    v-for="department in sortedDepartments" :key="department.id"
                    class="flex flex-row items-center justify-between text-xs mt-2 pt-2 first:border-t-0 border-t border-slate-100 border-solid  text-sky-900  group"
                    :class='{
                        " cursor-pointer hover:text-sky-700 group": department.route, "opacity-50 cursor-not-allowed": !department.route
                    }'>
                    <span>{{ department.name }}</span>
                    <Plus v-if="!department.active && department.route"
                        class="size-4 shrink-0 text-sky-700 opacity-0 group-hover:opacity-100"></Plus>
                    <CircleX v-if="department.active" class="size-4 shrink-0 text-red-700 hidden group-hover:block">
                    </CircleX>
                    <Check v-if="department.active" class="size-4 shrink-0 text-green-700 block group-hover:hidden">
                    </Check>
                </component>
            </div>
        </ScrollAreaViewport>
        <ScrollAreaScrollbar
            class="select-none touch-none p-0.5 z-20 bg-white transition-colors duration-150 ease-out hover:bg-slate-100 w-3 "
            orientation="vertical">
            <ScrollAreaThumb class="flex-1 bg-slate-500 rounded-sm" />
        </ScrollAreaScrollbar>


        <div class="absolute bottom-0 z-10 w-full h-6 bg-gradient-to-b from-transparent to-white" />
    </ScrollAreaRoot>
</template>
<script setup>
import { Check, CircleX, Plus } from 'lucide-vue-next';

import Fuse from 'fuse.js'
import { ScrollAreaRoot, ScrollAreaScrollbar, ScrollAreaThumb, ScrollAreaViewport } from 'reka-ui'

import { storeToRefs } from 'pinia'
import usePayloadsStore from '../../stores/payloads.js'
import useLocalizationsStore from '../../stores/localizations.js'
import { ref, computed } from 'vue'
const payloadsStore = usePayloadsStore()
const { departments } = storeToRefs(payloadsStore)
const localizationStore = useLocalizationsStore()
const { language, strings } = storeToRefs(localizationStore)
import { useRoute } from 'vue-router'
const route = useRoute()

const query = ref('')

const props = defineProps({
    selectedDepartments: {
        type: Array,
        required: true
    }
})

const currentlySelectedDepartmentIds = computed(() => {
    return props.selectedDepartments.map(dept => dept.id)
})

const deptToListableObject = (dept) => {

    const isCurrentlySelected = currentlySelectedDepartmentIds.value.includes(dept.id);

    let route;
    if (isCurrentlySelected) {
        route = { name: 'departments', params: { departments: currentlySelectedDepartmentIds.value.filter(id => id !== dept.id) } }
    } else if (currentlySelectedDepartmentIds.value.length >= 10) {
        route = null;
    } else {
        const newSelectedDepartments = [...currentlySelectedDepartmentIds.value, dept.id]
        route = { name: 'departments', params: { departments: newSelectedDepartments } }
    }

    return {
        'name': dept[`name_${language.value}`],
        'acronym': dept[`acronym_${language.value}`],
        'id': dept.id,
        'route': route,
        'active': isCurrentlySelected
    }
}

const sortedDepartments = computed(() => {
    if (departments.value === false) {
        return []
    }


    if (query.value.trim()) {
        const fuse = new Fuse(departments.value.map(dept => deptToListableObject(dept)), {
            keys: ['name', 'acronym'],
        })

        return fuse.search(query.value).map(result => result.item)
    }

    return [...departments.value].sort((a, b) => a[`name_${language.value}`].localeCompare(b[`name_${language.value}`])).map(dept => deptToListableObject(dept))
})

</script>