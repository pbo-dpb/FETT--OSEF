<template>
    <aside
        class="flex w-64 shrink-0 flex-col gap-2 rounded-lg border-2 border-solid bg-white px-2 py-4 shadow-lg"
        :class="{
            'border-transparent': highlighted,
        }"
        :style="{
            borderColor: highlighted ? department['color'] : 'transparent',
        }"
        @mouseenter="$emit('highlight-department', department.id)"
        @mouseleave="$emit('unhighlight-department', department.id)">
        <div class="flex flex-row items-center justify-between">
            <div
                class="flex flex-row items-center gap-2 px-4 font-medium text-slate-600 dark:text-slate-400">
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
                    stroke-linejoin="round">
                    <circle
                        cx="12"
                        cy="12"
                        r="10" />
                </svg>
                <span>{{ department[`acronym_${language}`] }}</span>
            </div>

            <button
                @click="$emit('remove-department', department.id)"
                class="group rounded p-1 hover:bg-slate-100">
                <CircleX
                    class="size-4 cursor-pointer text-slate-500 group-hover:text-red-800" />
                <span class="sr-only">{{
                    strings.dep_card_remove_button_aria_label
                }}</span>
            </button>
        </div>
        <header class="flex h-32 flex-col justify-end gap-2">
            <div
                class="flex flex-row items-center justify-between gap-2 px-4"></div>

            <div
                class="line-clamp-3 px-4 pb-2 text-xl leading-tight tracking-tight wrap-break-word">
                {{ department[`name_${language}`] }}
            </div>
        </header>
    <div class="border-t-2 border-solid border-slate-100 px-4 pt-4" v-if="latestValues">
            <div
                v-if="
                    latestValues.indeterminate === 0 &&
                    latestValues.combined > 0
                ">
                <dl class="flex flex-col gap-1">
                    <template
                        v-for="(value, key) in {
                            combined: numberFormatter(
                                Math.round(latestValues.combined),
                            ),
                        }"
                        :key="key">
                        <dt class="text-xs font-medium">
                            {{ strings[`dep_card_${key}`] }}
                        </dt>
                        <dd class="text-lg font-light">
                            {{ value }}
                        </dd>
                    </template>
                </dl>
                <div class="text-base/8 text-sm text-gray-500 italic">
                    {{ strings[latestCombinedNoteKey] }}
                </div>
            </div>
            <dl
                class="flex flex-col gap-1"
                v-else>
                <template
                    v-for="(value, key) in {
                        indeterminate: Math.round(latestValues.indeterminate),
                        term: Math.round(latestValues.term),
                        casual: Math.round(latestValues.casual),
                        student: Math.round(latestValues.student),
                        combined: numberFormatter(
                            Math.round(latestValues.indeterminate) +
                                Math.round(latestValues.term) +
                                Math.round(latestValues.casual) +
                                Math.round(latestValues.student),
                        ),
                    }"
                    :key="key">
                    <dt class="text-xs font-medium">
                        {{ strings[`dep_card_${key}`] }}
                    </dt>
                    <dd class="text-lg font-light">
                        {{ value }}
                    </dd>
                </template>
            </dl>

            <div
                class="mt-4 w-full text-right text-xs font-medium text-slate-500">
                {{
                    formattedDateLabel
                }}
            </div>
        </div>
    </aside>
</template>
<script setup>
    import { CircleX } from "lucide-vue-next";
    import { computed } from "vue";

    import { storeToRefs } from "pinia";
    import usePayloadsStore from "../../stores/payloads.js";
    import useLocalizationsStore from "../../stores/localizations.js";
    import useSettingsStore from "../../stores/settings.js";
    import numberFormatterMixin from "../../mixins/numberFormatter.js";

    const numberFormatter = numberFormatterMixin.methods.numberFormatter;

    const emits = defineEmits([
        "remove-department",
        "highlight-department",
        "unhighlight-department",
    ]);

    const payloadsStore = usePayloadsStore();
    const { departments } = storeToRefs(payloadsStore);
    const localizationStore = useLocalizationsStore();
    const { language, strings } = storeToRefs(localizationStore);
    const settingsStore = useSettingsStore();
    const { preferredMetric, preferredGranularity } = storeToRefs(settingsStore);

    const props = defineProps({
        department: {
            type: Object,
            required: true,
        },
        highlighted: {
            type: Boolean,
        },
    });

    const latestValues = computed(() => {
        const metric = preferredMetric.value === "pop" ? "pops" : "ftes";
        const granularity = preferredGranularity.value;
        const dataKey = `total_${metric}_per_${granularity}`;
        
        return props.department[dataKey]?.at(-1);
    });

    const latestCombinedNoteKey = computed(() =>
        preferredMetric.value === "pop"
            ? "department_latest_pops_combined_note"
            : "department_latest_ftes_combined_note",
    );

    const latestAsOfKey = computed(() =>
        preferredMetric.value === "pop"
            ? "department_latest_pops_as_of"
            : "department_latest_ftes_as_of",
    );

    const formattedDateLabel = computed(() => {
        const val = latestValues.value;

        if (!val) return "";

        let dateString = "";

        if (preferredGranularity.value === "quarter") {
            const prefix = language.value === 'fr' ? 'T' : 'Q';
            dateString = `${prefix}${val.quarter} ${val.year}`;
        } else {
            dateString = `${val.year}`;
        }

        return strings.value[latestAsOfKey.value]?.replace("{date}", dateString) || "";
});
</script>
