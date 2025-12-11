<template>
    <div class="flex flex-row items-center">
        <PreferredTimeFramePicker />
        <div role="separator" class="w-8 text-center cursor-default select-none text-slate-500">
            •
        </div>
        <PreferredGranularityPicker />
    </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'

import { onMounted } from 'vue';

import usePayloadsStore from '../stores/payloads.js'
import PreferredTimeFramePicker from './PreferredTimeFramePicker.vue';
import PreferredGranularityPicker from './PreferredGranularityPicker.vue';

const payloadsStore = usePayloadsStore()
const { aggregations } = storeToRefs(payloadsStore)


onMounted(() => {

    if (aggregations.value === false) {
        payloadsStore.fetchAggregations();
    }
});

</script>
