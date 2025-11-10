<template>
    <aside class="bg-white shadow-lg rounded-lg flex flex-col gap-2 w-64 p-2 shrink-0">

        <header class="flex flex-col justify-between h-36">
            <div class="text-right text-slate-500 px-4">
                {{ department[`acronym_${language}`] }}
            </div>

            <div
                class="text-xl tracking-tight leading-tight px-4 wrap-break-word line-clamp-3 border-b border-slate-100 pb-2">
                {{
                    department[`name_${language}`]
                }}
            </div>
        </header>

    </aside>
</template>
<script setup>

import { storeToRefs } from 'pinia'
import usePayloadsStore from '../../stores/payloads.js'
import useLocalizationsStore from '../../stores/localizations.js'
import { ref, computed } from 'vue'

const payloadsStore = usePayloadsStore()
const { departments } = storeToRefs(payloadsStore)
const localizationStore = useLocalizationsStore()
const { language, strings } = storeToRefs(localizationStore)

const props = defineProps({
    department: {
        type: Object,
        required: true
    }
})

</script>