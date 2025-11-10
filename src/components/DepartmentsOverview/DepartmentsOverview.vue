<template>

    <div class="flex flex-col gap-4" v-if="departments !== false">
        <div>OVERVIEW</div>

        <div class="grid grid-cols-4 gap-4">

            <DepartmentPicker />
            <div class="col-span-3">
                PICKED DEPARTMENTS
            </div>


        </div>

    </div>
    <div v-else>
        <LoadingIndicator class="size-6" />
    </div>

</template>
<script setup>
import { storeToRefs } from 'pinia'
import { onMounted } from 'vue'
import usePayloadsStore from '../../stores/payloads.js'
const payloadsStore = usePayloadsStore()
const { departments } = storeToRefs(payloadsStore)
import DepartmentPicker from './DepartmentPicker.vue'
import LoadingIndicator from '../LoadingIndicator.vue'

onMounted(() => {
    if (departments.value === false) {
        payloadsStore.fetchDepartments();
    }
});


</script>
