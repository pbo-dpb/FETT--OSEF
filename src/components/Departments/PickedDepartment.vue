<template>
  <aside
    class="bg-white shadow-lg rounded-lg flex flex-col gap-2 w-64 px-2 py-4 shrink-0 border-2 border-solid"
    :class="{
      'border-transparent': highlighted,
    }"
    :style="{ borderColor: highlighted ? department['color'] : 'transparent' }"
    @mouseenter="$emit('highlight-department', department.id)"
    @mouseleave="$emit('unhighlight-department', department.id)"
  >
    <div class="flex flex-row justify-between items-center">
      <div
        class="text-slate-600 dark:text-slate-400 flex flex-row items-center gap-2 font-medium px-4"
      >
        <svg
          style="color: lightblue"
          class="size-4"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          :fill="department['color'] ?? 'currentColor'"
          :stroke="
            highlighted
              ? (department['color'] ?? 'currentColor')
              : 'transparent'
          "
          stroke-width="4"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
        </svg>
        <span>{{ department[`acronym_${language}`] }}</span>
      </div>

      <button
        @click="$emit('remove-department', department.id)"
        class="p-1 rounded hover:bg-slate-100 group"
      >
        <CircleX
          class="size-4 text-slate-500 group-hover:text-red-800 cursor-pointer"
        />
        <span class="sr-only">{{
          strings.dep_card_remove_button_aria_label
        }}</span>
      </button>
    </div>
    <header class="flex flex-col justify-end h-32 gap-2">
      <div class="flex flex-row items-center justify-between gap-2 px-4"></div>

      <div
        class="text-xl tracking-tight leading-tight px-4 wrap-break-word line-clamp-3 pb-2"
      >
        {{ department[`name_${language}`] }}
      </div>
    </header>
    <div class="border-t-2 border-slate-100 border-solid px-4 pt-4">
      <div
        v-if="
          department.latest_ftes.indeterminate === 0 &&
          department.latest_ftes.combined > 0
        "
      >
        <dl class="flex flex-col gap-1">
          <template
            v-for="(value, key) in {
              combined: department.latest_ftes.combined,
            }"
            :key="key"
          >
            <dt class="font-medium text-xs">
              {{ strings[`dep_card_${key}`] }}
            </dt>
            <dd class="text-lg font-light">
              {{ numberFormatter(Math.round(value)) }}
            </dd>
          </template>
        </dl>
        <div class="text-gray-500 text-sm italic text-base/8">
          {{ strings.department_latest_ftes_combined_note }}
        </div>
      </div>
      <dl class="flex flex-col gap-1" v-else>
        <template
          v-for="(value, key) in {
            indeterminate: department.latest_ftes.indeterminate,
            term: department.latest_ftes.term,
            casual: department.latest_ftes.casual,
            student: department.latest_ftes.student,
          }"
          :key="key"
        >
          <dt class="font-medium text-xs">{{ strings[`dep_card_${key}`] }}</dt>
          <dd class="text-lg font-light">
            {{ numberFormatter(Math.round(value)) }}
          </dd>
        </template>
      </dl>

      <div class="w-full text-xs font-medium text-slate-500 text-right mt-4">
        {{
          strings.department_latest_ftes_as_of.replace(
            "{date}",
            new Intl.DateTimeFormat(language, {
              year: "numeric",
              month: "long",
            }).format(
              new Date(
                `${department.latest_ftes.year}-${department.latest_ftes.month}-01`,
              ),
            ),
          )
        }}
      </div>
    </div>
  </aside>
</template>
<script setup>
import { CircleX } from "lucide-vue-next";

import { storeToRefs } from "pinia";
import usePayloadsStore from "../../stores/payloads.js";
import useLocalizationsStore from "../../stores/localizations.js";
import { onMounted } from "vue";

const emits = defineEmits([
  "remove-department",
  "highlight-department",
  "unhighlight-department",
]);

const payloadsStore = usePayloadsStore();
const { departments } = storeToRefs(payloadsStore);
const localizationStore = useLocalizationsStore();
const { language, strings } = storeToRefs(localizationStore);

const props = defineProps({
  department: {
    type: Object,
    required: true,
  },
  highlighted: {
    type: Boolean,
  },
});

const numberFormatter = (number) => {
  return localizationStore.localizeNumber(number);
};
</script>
