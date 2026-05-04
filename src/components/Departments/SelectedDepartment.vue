<template>
    <tr
        @mouseenter="$emit('highlight-department', department.id)"
        @mouseleave="$emit('unhighlight-department', department.id)"
        class="border-t-1 border-solid border-slate-300"
        :class="{ 'bg-slate-100': highlighted }">
        <th
            scope="row"
            class="p-2 text-left">
            <span class="inline-flex items-center gap-2">
                <span
                    class="size-2.5 rounded-full"
                    :style="{
                        backgroundColor: department.color || 'transparent',
                    }"
                    aria-hidden="true" />
                <span class="font-normal">
                    {{ department[`name_${language}`] }}
                    <template v-if="department[`acronym_${language}`]">
                        ({{ department[`acronym_${language}`] }})</template
                    >
                </span>
            </span>
        </th>
        <td class="p-2 text-center">
            {{
                hasBreakdown
                    ? numberFormatter(
                          Math.round(selectedValues?.indeterminate || 0),
                      )
                    : "N/A"
            }}
        </td>
        <td class="p-2 text-center">
            {{
                hasBreakdown
                    ? numberFormatter(Math.round(selectedValues?.term || 0))
                    : "N/A"
            }}
        </td>
        <td class="p-2 text-center">
            {{
                hasBreakdown
                    ? numberFormatter(Math.round(selectedValues?.student || 0))
                    : "N/A"
            }}
        </td>
        <td class="p-2 text-center">
            {{
                hasBreakdown
                    ? numberFormatter(Math.round(selectedValues?.casual || 0))
                    : "N/A"
            }}
        </td>
        <td class="p-2 text-center font-semibold">
            {{ numberFormatter(total) }}
        </td>
        <td class="p-2 text-center align-middle">
            <button
                @click="$emit('remove-department', department.id)"
                class="mx-auto inline-flex size-8 cursor-pointer items-center justify-center"
                :aria-label="strings.dep_card_remove_button_aria_label">
                <CircleX size="20" />
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
            required: true,
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

    const selectedValues = computed(() => {
        return props.department.total_ftes_per_quarter?.find(
            (item) =>
                item.year === props.selectedYear &&
                item.quarter === props.selectedQuarter,
        );
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
