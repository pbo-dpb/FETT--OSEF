<template>
    <ToggleGroupRoot v-model="preferredTimeframe" type="single" class="flex flex-row gap-2">
        <ToggleGroupItem value="1Y" aria-label="Toggle italic" :class="toggleGroupItemClasses">
            {{ strings.preferred_timeframe_1y }}
        </ToggleGroupItem>
        <ToggleGroupItem value="3Y" aria-label="Toggle italic" :class="toggleGroupItemClasses">
            {{ strings.preferred_timeframe_3y }}
        </ToggleGroupItem>
        <ToggleGroupItem value="5Y" aria-label="Toggle italic" :class="toggleGroupItemClasses">
            {{ strings.preferred_timeframe_5y }}
        </ToggleGroupItem>
        <ToggleGroupItem value="10Y" aria-label="Toggle italic" :class="toggleGroupItemClasses">
            {{ strings.preferred_timeframe_10y }}
        </ToggleGroupItem>
        <ToggleGroupItem value="MAX" aria-label="Toggle italic" :class="toggleGroupItemClasses">
            {{ strings.preferred_timeframe_max }}
        </ToggleGroupItem>
    </ToggleGroupRoot>
</template>
<script setup>
import { ToggleGroupItem, ToggleGroupRoot } from 'reka-ui'
import { storeToRefs } from 'pinia'

import useLocalizationsStore from '../stores/localizations.js'
const localizationsStore = useLocalizationsStore()
const { language, strings } = storeToRefs(localizationsStore)

import useSettingsStore from '../stores/settings.js'
const settingsStore = useSettingsStore()
const { preferredTimeframe } = storeToRefs(settingsStore)

const toggleGroupItemClasses = [
    "px-1",
    "py-0.5",
    "bg-slate-50",
    "text-xs",
    "font-medium",
    "text-slate-700",
    "rounded",
    "data-[state=on]:bg-slate-300",
    "data-[state=off]:cursor-pointer",


]

</script>