<template>
    <div class="flex flex-col gap-1">
        <span
            id="preferred-metric-label"
            class="font-semibold">
            {{ strings.preferred_timeframe_label }}
        </span>
        <div class="flex flex-row flex-wrap gap-2">
            <label
                for="tf-1y"
                :class="[
                    ...toggleRadioBaseClasses,
                    preferredTimeframe === '1Y'
                        ? 'bg-gray-900 text-white'
                        : 'border border-solid border-gray-300 bg-white',
                ]">
                <input
                    type="radio"
                    name="preferred_timeframe"
                    id="tf-1y"
                    value="1Y"
                    :checked="preferredTimeframe === '1Y'"
                    @change="preferredTimeframe = '1Y'"
                    class="sr-only" />
                {{ strings.preferred_timeframe_1y }}
            </label>
            <label
                for="tf-3y"
                :class="[
                    ...toggleRadioBaseClasses,
                    preferredTimeframe === '3Y'
                        ? 'bg-gray-900 text-white'
                        : 'border border-solid border-gray-300 bg-white',
                ]">
                <input
                    type="radio"
                    name="preferred_timeframe"
                    id="tf-3y"
                    value="3Y"
                    :checked="preferredTimeframe === '3Y'"
                    @change="preferredTimeframe = '3Y'"
                    class="sr-only" />
                {{ strings.preferred_timeframe_3y }}
            </label>
            <label
                for="tf-5y"
                :class="[
                    ...toggleRadioBaseClasses,
                    preferredTimeframe === '5Y'
                        ? 'bg-gray-900 text-white'
                        : 'border border-solid border-gray-300 bg-white',
                ]">
                <input
                    type="radio"
                    name="preferred_timeframe"
                    id="tf-5y"
                    value="5Y"
                    :checked="preferredTimeframe === '5Y'"
                    @change="preferredTimeframe = '5Y'"
                    class="sr-only" />
                {{ strings.preferred_timeframe_5y }}
            </label>
            <label
                for="tf-max"
                :class="[
                    ...toggleRadioBaseClasses,
                    preferredTimeframe === 'MAX'
                        ? 'bg-gray-900 text-white'
                        : 'border border-solid border-gray-300 bg-white',
                ]">
                <input
                    type="radio"
                    name="preferred_timeframe"
                    id="tf-max"
                    value="MAX"
                    :checked="preferredTimeframe === 'MAX'"
                    @change="preferredTimeframe = 'MAX'"
                    class="sr-only" />
                {{ strings.preferred_timeframe_max }}
            </label>
        </div>
    </div>
</template>

<script setup>
    import { storeToRefs } from "pinia";
    import { toggleRadioBaseClasses } from "./toggleRadioClasses.js";

    import useSettingsStore from "@/stores/settings.js";
    const settingsStore = useSettingsStore();
    const { preferredTimeframe } = storeToRefs(settingsStore);

    import useLocalizationsStore from "@/stores/localizations.js";
    const localizationsStore = useLocalizationsStore();
    const { strings } = storeToRefs(localizationsStore);
</script>
