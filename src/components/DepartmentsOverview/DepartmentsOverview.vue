<template>

    <div class="flex flex-col gap-4" v-if="departments !== false">
        <div>OVERVIEW</div>

        <div class="grid grid-cols-4 gap-4">

            <DepartmentPicker :selected-departments="selectedDepartments" />

            <div
                class="col-span-3 flex flex-row gap-4 overflow-x-scroll  bg-slate-50 p-4 rounded-tl rounded-t-lg shadow-inner">
                <PickedDepartment v-for="department in selectedDepartments" :key="department.id"
                    :department="department" @remove-department="removeDepartment" />
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
import DepartmentPicker from './DepartmentPicker.vue'
import LoadingIndicator from '../LoadingIndicator.vue'
import { useRoute, useRouter } from 'vue-router'
import PickedDepartment from './PickedDepartment.vue'
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
