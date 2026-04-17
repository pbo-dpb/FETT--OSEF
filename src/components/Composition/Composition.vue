<template>
    <div class="flex grid-cols-5 flex-col gap-4 lg:grid">
        <template v-if="readyToRender">
            <div class="flex w-full flex-col gap-8 lg:col-span-5">
                <GeneralChartSettings />
                <MainChart />
            </div>
        </template>
        <LoadingIndicator
            v-else
            class="col-span-5 size-8" />
    </div>
</template>
<script setup>
    import { storeToRefs } from "pinia";

    import { computed, onMounted } from "vue";
    import MainChart from "./MainChart.vue";
    import LoadingIndicator from "@/components/Shared/UI/LoadingIndicator.vue";

    import usePayloadsStore from "@/stores/payloads.js";
    import GeneralChartSettings from "@/components/Shared/Controls/Chart/GeneralChartSettings.vue";

    const payloadsStore = usePayloadsStore();
    const { composition } = storeToRefs(payloadsStore);

    const readyToRender = computed(() => {
        return composition.value !== false;
    });

    onMounted(() => {
        if (composition.value === false) {
            payloadsStore.fetchComposition();
        }
    });
</script>
