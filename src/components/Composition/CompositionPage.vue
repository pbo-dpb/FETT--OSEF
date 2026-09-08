<template>
    <div class="flex flex-col gap-4">
        <template v-if="readyToRender">
            <div class="flex w-full flex-col gap-8">
                <PageHeader
                    :heading="strings.composition_heading"
                    :description="strings.composition_description" />
                <CompositionChart />
            </div>
            <Footnotes :footnotes="[strings.composition_footnote_1]" />
        </template>
        <LoadingIndicator
            v-else
            class="size-8" />
    </div>
</template>
<script setup>
    import { computed, onMounted } from "vue";
    import { storeToRefs } from "pinia";

    import usePayloadsStore from "@/stores/payloads.js";
    import useLocalizationStore from "@/stores/localizations.js";

    import {
        Footnotes,
        LoadingIndicator,
        PageHeader,
    } from "@/components/Shared";
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
