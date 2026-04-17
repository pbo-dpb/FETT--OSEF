<template>
    <div class="flex flex-wrap items-center gap-x-8 gap-y-4">
        <PreferredMetricPicker />
        <PreferredTimeFramePicker />
        <PreferredGranularityPicker />
    </div>
</template>

<script setup>
    import { onMounted } from "vue";
    import { storeToRefs } from "pinia";
    import usePayloadsStore from "@/stores/payloads.js";
    import PreferredMetricPicker from "./PreferredMetricPicker.vue";
    import PreferredTimeFramePicker from "./PreferredTimeFramePicker.vue";
    import PreferredGranularityPicker from "./PreferredGranularityPicker.vue";

    const payloadsStore = usePayloadsStore();
    const { composition } = storeToRefs(payloadsStore);

    onMounted(() => {
        if (composition.value === false) {
            payloadsStore.fetchComposition();
        }
    });
</script>
