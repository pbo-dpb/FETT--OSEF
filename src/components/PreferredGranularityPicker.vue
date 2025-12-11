<template>
    <ToggleGroupRoot v-model="preferredGranularity" type="single" class="flex flex-row gap-2" required>
        <ToggleGroupItem value="quarter" :class="toggleGroupItemClasses" :disabled="preferredGranularity === 'quarter'">
            {{ strings.preferred_granularity_quarter }}
        </ToggleGroupItem>
        <ToggleGroupItem value="fiscal_year" :class="toggleGroupItemClasses"
            :disabled="preferredGranularity === 'fiscal_year'">
            {{ strings.preferred_granularity_fiscal_year }}
        </ToggleGroupItem>
    </ToggleGroupRoot>
</template>
<script setup>
import { ToggleGroupItem, ToggleGroupRoot } from 'reka-ui'
import { storeToRefs } from 'pinia'

import useLocalizationsStore from '../stores/localizations.js'
const localizationsStore = useLocalizationsStore()
const { strings } = storeToRefs(localizationsStore)

import useSettingsStore from '../stores/settings.js'
const settingsStore = useSettingsStore()
const { preferredGranularity } = storeToRefs(settingsStore)

const toggleGroupItemClasses = [
    "px-1",
    "py-0.5",
    "bg-slate-50",
    "text-xs",
    "font-medium",
    "text-slate-700",
    "rounded",
    "select-none",
    "data-[state=on]:bg-slate-300",
    "data-[state=off]:cursor-pointer",
]

</script>