<template>
    <div class="flex flex-col gap-1">
        <span
            id="preferred-metric-label"
            class="font-semibold">
            {{ strings.preferred_metric_label }}
        </span>
        <div class="flex flex-row flex-wrap gap-2">
            <label
                for="fte"
                :class="[
                    'px-2',
                    'py-0.5',
                    'font-semibold',
                    'rounded-sm',
                    'select-none',
                    'cursor-pointer',
                    'has-[:focus-visible]:outline',
                    'has-[:focus-visible]:outline-2',
                    'has-[:focus-visible]:outline-solid',
                    'has-[:focus-visible]:outline-offset-2',
                    'has-[:focus-visible]:outline-gray-900',
                    preferredMetric === 'fte'
                        ? 'bg-gray-900 text-white'
                        : 'border border-solid border-gray-300 bg-white',
                ]">
                <input
                    type="radio"
                    name="preferred_metric"
                    id="fte"
                    value="fte"
                    :checked="preferredMetric === 'fte'"
                    @change="preferredMetric = 'fte'"
                    class="sr-only" />
                {{ strings.preferred_metric_fte }}
            </label>
            <label
                for="headcount"
                :class="[
                    'px-2',
                    'py-0.5',
                    'font-semibold',
                    'rounded-sm',
                    'select-none',
                    'cursor-pointer',
                    'has-[:focus-visible]:outline',
                    'has-[:focus-visible]:outline-2',
                    'has-[:focus-visible]:outline-solid',
                    'has-[:focus-visible]:outline-offset-2',
                    'has-[:focus-visible]:outline-gray-900',
                    preferredMetric === 'pop'
                        ? 'bg-gray-900 text-white'
                        : 'border border-solid border-gray-300 bg-white',
                ]">
                <input
                    type="radio"
                    name="preferred_metric"
                    id="headcount"
                    value="pop"
                    :checked="preferredMetric === 'pop'"
                    @change="preferredMetric = 'pop'"
                    class="sr-only" />
                {{ strings.preferred_metric_headcount }}
            </label>
        </div>
    </div>
</template>

<script setup>
    import { storeToRefs } from "pinia";

    import useSettingsStore from "@/stores/settings.js";
    const settingsStore = useSettingsStore();
    const { preferredMetric } = storeToRefs(settingsStore);

    import useLocalizationsStore from "@/stores/localizations.js";
    const localizationsStore = useLocalizationsStore();
    const { strings } = storeToRefs(localizationsStore);
</script>
