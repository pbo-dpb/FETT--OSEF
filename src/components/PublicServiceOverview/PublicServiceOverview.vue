<template>


    <div class="flex flex-col lg:grid grid-cols-5 gap-4">
        <template v-if="readyToRender">
            <div class="w-full lg:col-span-3 flex flex-col gap-2">
                <div class="flex flex-row justify-between items-center">
                    <PreferredTimeFramePicker />
                </div>
                <MainChart />
            </div>
            <div class="w-full lg:col-span-2">
                Insights Panel
            </div>
        </template>
        <LoadingIndicator v-else class="col-span-5 size-8" />
    </div>

</template>
<script setup>
import { storeToRefs } from 'pinia'

import { computed, onMounted } from 'vue';
import MainChart from './MainChart.vue';
import LoadingIndicator from '../LoadingIndicator.vue';


import usePayloadsStore from '../../stores/payloads.js'
import PreferredTimeFramePicker from '../PreferredTimeFramePicker.vue';
const payloadsStore = usePayloadsStore()
const { aggregations } = storeToRefs(payloadsStore)

const readyToRender = computed(() => {

    return aggregations.value !== false;
});

onMounted(() => {

    if (aggregations.value === false) {
        payloadsStore.fetchAggregations();
    }
});

</script>
