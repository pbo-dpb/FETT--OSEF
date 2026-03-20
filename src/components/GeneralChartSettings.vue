<template>
    <div class="flex items-center">
        <PreferredMetricPicker />
        <Separator />
        <PreferredTimeFramePicker />
        <Separator />
        <PreferredGranularityPicker />
    </div>
</template>

<script setup>
    import { storeToRefs } from "pinia";

    import { onMounted } from "vue";

    import usePayloadsStore from "../stores/payloads.js";
    import Separator from "./Separator.vue";
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
