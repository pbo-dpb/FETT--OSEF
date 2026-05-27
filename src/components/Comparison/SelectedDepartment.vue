<template>
    <tr
        @mouseenter="$emit('highlight-department', department.id)"
        @mouseleave="$emit('unhighlight-department', department.id)"
        class="mb-4 block rounded-sm border-y-1 border-r-1 border-l-4 border-solid p-2 md:mb-0 md:mb-2 md:table-row md:border-l-0 md:p-0"
        :style="{
            backgroundColor: highlighted
                ? `${department.color}10`
                : 'transparent',
            borderLeftColor: department.color || 'transparent',
        }">
        <th
            scope="row"
            class="block p-2 text-left md:table-cell md:border-l-4 md:border-solid"
            :style="{ borderLeftColor: department.color || 'transparent' }">
            <span class="inline-flex items-center gap-2">
                <span
                    class="hidden md:size-2.5 md:shrink-0 md:rounded-full"
                    :style="{
                        backgroundColor: department.color || 'transparent',
                    }"
                    aria-hidden="true" />
                <span class="text-xl font-normal md:text-base">
                    {{ department[`name_${language}`] }}
                    <template v-if="department[`acronym_${language}`]">
                        ({{ department[`acronym_${language}`] }})</template
                    >
                </span>
            </span>
        </th>
        <td
            class="block flex items-center justify-between p-2 text-center md:table-cell">
            <span class="md:hidden">{{ strings.dep_indeterminate }}</span>
            <span class="text-right md:text-center">
                {{
                    hasBreakdown
                        ? numberFormatter(
                              Math.round(selectedValues?.indeterminate || 0),
                          )
                        : "N/A"
                }}
            </span>
        </td>
        <td
            class="block flex items-center justify-between p-2 text-center md:table-cell">
            <span class="md:hidden">{{ strings.dep_term }}</span>
            <span class="text-right md:text-center">
                {{
                    hasBreakdown
                        ? numberFormatter(Math.round(selectedValues?.term || 0))
                        : "N/A"
                }}
            </span>
        </td>
        <td
            class="block flex items-center justify-between p-2 text-center md:table-cell">
            <span class="md:hidden">{{ strings.dep_student }}</span>
            <span class="text-right md:text-center">
                {{
                    hasBreakdown
                        ? numberFormatter(
                              Math.round(selectedValues?.student || 0),
                          )
                        : "N/A"
                }}
            </span>
        </td>
        <td
            class="block flex items-center justify-between p-2 text-center md:table-cell">
            <span class="md:hidden">{{ strings.dep_casual }}</span>
            <span class="text-right md:text-center">
                {{
                    hasBreakdown
                        ? numberFormatter(
                              Math.round(selectedValues?.casual || 0),
                          )
                        : "N/A"
                }}
            </span>
        </td>
        <td
            class="block flex items-center justify-between p-2 text-center font-semibold md:table-cell">
            <span class="md:hidden">{{ strings.total_label }}</span>
            <span class="text-right md:text-center">
                {{ numberFormatter(total) }}
            </span>
        </td>
        <td
            class="block flex items-center justify-between p-2 text-center align-middle md:table-cell">
            <span class="hidden md:sr-only">{{
                strings.departments_table_actions_column
            }}</span>
            <button
                @click="$emit('remove-department', department.id)"
                class="flex w-full cursor-pointer items-center justify-center rounded-sm border border-solid border-gray-300 bg-white py-2 font-semibold md:mx-auto md:inline-flex md:size-8 md:border-none md:bg-transparent"
                :aria-label="strings.dep_card_remove_button_aria_label">
                <span class="md:hidden">{{
                    strings.dep_card_remove_button_aria_label
                }}</span>
                <CircleX
                    class="hidden md:block"
                    size="20" />
            </button>
        </td>
    </tr>
</template>
<script setup>
    import { computed } from "vue";
    import { storeToRefs } from "pinia";
    import { CircleX } from "lucide-vue-next";
    import useLocalizationsStore from "@/stores/localizations.js";
    import numberFormatterMixin from "@/mixins/numberFormatter.js";

    const numberFormatter = numberFormatterMixin.methods.numberFormatter;

    import useSettingsStore from "@/stores/settings.js";
    const settingsStore = useSettingsStore();
    const { preferredMetric, preferredGranularity } =
        storeToRefs(settingsStore);

    const localizationsStore = useLocalizationsStore();
    const { language, strings } = storeToRefs(localizationsStore);

    defineEmits([
        "remove-department",
        "highlight-department",
        "unhighlight-department",
    ]);

    const props = defineProps({
        department: {
            type: Object,
            required: true,
        },
        selectedQuarter: {
            type: Number,
            default: null,
        },
        selectedYear: {
            type: Number,
            required: true,
        },
        highlighted: {
            type: Boolean,
            default: false,
        },
    });

    const metricDataKey = computed(() => {
        const isQuarterly = preferredGranularity.value === "quarter";

        if (preferredMetric.value === "pop") {
            return isQuarterly
                ? "total_pops_per_quarter"
                : "total_pops_per_fiscal_year";
        }

        return isQuarterly
            ? "total_ftes_per_quarter"
            : "total_ftes_per_fiscal_year";
    });

    const selectedValues = computed(() => {
        const isQuarterly = preferredGranularity.value === "quarter";

        return props.department[metricDataKey.value]?.find((item) => {
            if (item.year !== props.selectedYear) {
                return false;
            }

            if (!isQuarterly) {
                return true;
            }

            return item.quarter === props.selectedQuarter;
        });
    });

    const hasBreakdown = computed(() => {
        if (!selectedValues.value) return false;
        const { indeterminate, combined } = selectedValues.value;
        return !(indeterminate === 0 && combined > 0);
    });

    const total = computed(() => {
        if (!selectedValues.value) return 0;
        const { indeterminate, term, casual, student, combined } =
            selectedValues.value;
        const sum =
            Math.round(indeterminate || 0) +
            Math.round(term || 0) +
            Math.round(casual || 0) +
            Math.round(student || 0);
        if (sum === 0 && combined > 0) return Math.round(combined);
        return sum;
    });
</script>
