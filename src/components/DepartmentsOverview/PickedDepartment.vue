<template>
    <aside class="bg-white shadow-lg rounded-lg flex flex-col gap-2 w-64 p-2 shrink-0">
        <div class="flex flex-row justify-end">
            <button @click="$emit('remove-department', department.id)" class="p-1 rounded hover:bg-slate-100">
                <CircleX class="size-4 text-slate-500 hover:text-red-800 cursor-pointer" />
                <span class="sr-only">{{ strings.dep_card_remove_button_aria_label }}</span>
            </button>
        </div>
        <header class="flex flex-col justify-end h-32 gap-2">
            <div class="flex flex-row items-center justify-between gap-2 px-4">
                <div class="text-slate-500 ">
                    {{ department[`acronym_${language}`] }}
                </div>
                <svg style="color:lightblue" class="size-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                    fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10" />
                </svg>
            </div>

            <div class="text-xl tracking-tight leading-tight px-4 wrap-break-word line-clamp-3 pb-2">
                {{
                    department[`name_${language}`]
                }}
            </div>
        </header>
        <div class="border-t-2 border-slate-100 border-solid px-4 pt-4 ">


            <dl class="flex flex-col gap-1">
                <template
                    v-for="(value, key) in { indeterminate: department.latest_ftes.indeterminate, term: department.latest_ftes.term, casual: department.latest_ftes.casual, student: department.latest_ftes.student, combined: department.latest_ftes.combined }"
                    :key="key">
                    <dt class="font-medium text-xs">{{ strings[`dep_card_${key}`] }}</dt>
                    <dd class="text-lg font-light">{{ Math.round(value) }}</dd>
                </template>
            </dl>


        </div>

    </aside>
</template>
<script setup>
import { CircleX } from 'lucide-vue-next';

import { storeToRefs } from 'pinia'
import usePayloadsStore from '../../stores/payloads.js'
import useLocalizationsStore from '../../stores/localizations.js'
import { ref, computed, defineEmits } from 'vue'

const emits = defineEmits(['remove-department'])

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