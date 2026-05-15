<template>
    <div class="flex grid-cols-5 flex-col gap-4 lg:grid">
        <template v-if="readyToRender">
            <div class="flex w-full flex-col gap-8 lg:col-span-5">
                <PageHeader
                    :heading="strings.composition_heading"
                    :description="strings.composition_description" />

                <CompositionChart />
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

    import { LoadingIndicator, PageHeader } from "@/components/Shared";
    import CompositionChart from "./CompositionChart.vue";

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
