<template>
    <div class="flex grid-cols-5 flex-col gap-4 lg:grid">
        <template v-if="readyToRender">
            <div class="flex w-full flex-col gap-8 lg:col-span-5">
                <div>
                    <h3 class="mb-4 text-2xl text-balance">
                        {{ strings.composition_heading }}
                    </h3>
                    <p>{{ strings.composition_description }}</p>
                </div>
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
    import { computed, onMounted } from "vue";
    import { storeToRefs } from "pinia";

    import usePayloadsStore from "@/stores/payloads.js";
    import useLocalizationStore from "@/stores/localizations.js";

    import GeneralChartSettings from "@/components/Shared/Controls/Chart/GeneralChartSettings.vue";
    import MainChart from "./MainChart.vue";
    import LoadingIndicator from "@/components/Shared/UI/LoadingIndicator.vue";

    const payloadsStore = usePayloadsStore();
    const { composition } = storeToRefs(payloadsStore);

    const localizationStore = useLocalizationStore();
    const { strings } = storeToRefs(localizationStore);

    const readyToRender = computed(() => {
        return composition.value !== false;
    });

    onMounted(() => {
        if (composition.value === false) {
            payloadsStore.fetchComposition();
        }
    });
</script>
