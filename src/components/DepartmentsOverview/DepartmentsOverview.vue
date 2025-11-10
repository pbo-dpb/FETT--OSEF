<template>

    <div class="flex flex-col gap-4" v-if="departments !== false">
        <div>OVERVIEW</div>

        <div class="grid grid-cols-4 gap-4">

            <DepartmentPicker :selected-departments="selectedDepartments" />

            <div v-if="selectedDepartments.length"
                class="col-span-3 flex flex-row gap-4 overflow-x-scroll  bg-slate-50 p-4 rounded-tl rounded-t-lg shadow-inner">
                <PickedDepartment v-for="department in selectedDepartments" :key="department.id"
                    :department="department" @remove-department="removeDepartment" />
            </div>
            <div class="col-span-3 flex flex-col gap-2 justify-center items-center bg-slate-50 p-4 text-slate-500">

                <p class="text-lg font-medium">
                    {{ strings.departments_overview_no_departments_selected_message }}
                </p>
                <ArrowBigLeft class="size-8" />
            </div>


        </div>

    </div>
    <div v-else>
        <LoadingIndicator class="size-6" />
    </div>

</template>
<script setup>
import { computed } from 'vue'

import { storeToRefs } from 'pinia'
import { onMounted } from 'vue'
import usePayloadsStore from '../../stores/payloads.js'
const payloadsStore = usePayloadsStore()
const { departments } = storeToRefs(payloadsStore)
import useLocalizationsStore from '../../stores/localizations.js'

const localizationStore = useLocalizationsStore()
const { strings } = storeToRefs(localizationStore)
import DepartmentPicker from './DepartmentPicker.vue'
import LoadingIndicator from '../LoadingIndicator.vue'
import { useRoute, useRouter } from 'vue-router'
import PickedDepartment from './PickedDepartment.vue'
import { ArrowBigLeft } from 'lucide-vue-next'
const route = useRoute()
const router = useRouter()

onMounted(() => {
    if (departments.value === false) {
        payloadsStore.fetchDepartments();
    }
});

const selectedDepartments = computed(() => {
    const departmanetIds = route.params.departments || [];
    return departments.value.filter(dept => departmanetIds.includes(dept.id));
})

const removeDepartment = (departmentId) => {
    const newSelectedDepartments = selectedDepartments.value
        .map(dept => dept.id)
        .filter(id => id !== departmentId);
    router.push({ name: 'departments', params: { departments: newSelectedDepartments } });
}

</script>
