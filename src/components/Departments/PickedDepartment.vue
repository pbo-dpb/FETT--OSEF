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
        <div class="border-t-2 border-solid border-slate-100 px-4 pt-4">
            <div
                v-if="
                    department.latest_ftes.indeterminate === 0 &&
                    department.latest_ftes.combined > 0
                ">
                <dl class="flex flex-col gap-1">
                    <template
                        v-for="(value, key) in {
                            combined: department.latest_ftes.combined,
                        }"
                        :key="key">
                        <dt class="text-xs font-medium">
                            {{ strings[`dep_card_${key}`] }}
                        </dt>
                        <dd class="text-lg font-light">
                            {{ numberFormatter(Math.round(value)) }}
                        </dd>
                    </template>
                </dl>
                <div class="text-base/8 text-sm text-gray-500 italic">
                    {{ strings.department_latest_ftes_combined_note }}
                </div>
            </div>
            <dl
                class="flex flex-col gap-1"
                v-else>
                <template
                    v-for="(value, key) in {
                        indeterminate: department.latest_ftes.indeterminate,
                        term: department.latest_ftes.term,
                        casual: department.latest_ftes.casual,
                        student: department.latest_ftes.student,
                    }"
                    :key="key">
                    <dt class="text-xs font-medium">
                        {{ strings[`dep_card_${key}`] }}
                    </dt>
                    <dd class="text-lg font-light">
                        {{ numberFormatter(Math.round(value)) }}
                    </dd>
                </template>
            </dl>

            <div
                class="mt-4 w-full text-right text-xs font-medium text-slate-500">
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
