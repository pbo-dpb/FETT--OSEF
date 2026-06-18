<template>
    <PageHeader
        :heading="strings.comparison_heading"
        :description="strings.comparison_description" />
    <Combobox
        v-model="selectedDepartment"
        immediate
        as="div"
        v-slot="{ open }"
        class="relative w-full"
        :class="{
            'mb-48': selectedDepartments.length === 0,
        }">
        <div
            class="relative border bg-white shadow-sm dark:bg-gray-950"
            :class="
                open
                    ? 'border-gray-500 dark:border-gray-100'
                    : 'border-gray-300 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-100'
            ">
            <ComboboxInput
                class="w-full rounded-sm border border-solid border-gray-300 bg-white py-2 pr-12 pl-4 text-gray-700 outline-offset-4 placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:placeholder:text-gray-300"
                :displayValue="displayDepartment"
                :placeholder="
                    strings.departments_overview_no_departments_selected_message
                "
                @change="query = $event.target.value" />
            <ComboboxButton
                class="absolute inset-y-0 right-0 flex cursor-pointer items-center px-3 text-gray-700 dark:text-gray-100"
                :aria-label="strings.departments_combobox_toggle_aria_label">
                <ChevronsUpDown class="size-4" />
            </ComboboxButton>
        </div>
        <ComboboxOptions
            class="absolute z-20 mt-2 max-h-48 w-full overflow-auto rounded-sm border border-solid border-gray-300 bg-white p-1 text-gray-700 shadow-xl focus:outline-none dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100">
            <li
                v-if="departments === false"
                class="cursor-default rounded-sm px-3 py-2">
                {{ strings.departments_loading_message }}
            </li>
            <li
                v-else-if="!filteredDepartments.length"
                class="cursor-default rounded-sm px-3 py-2">
                {{ strings.departments_none_found_message }}
            </li>
            <ComboboxOption
                v-for="department in filteredDepartments"
                :key="department.id"
                :value="department"
                v-slot="{ active, selected, disabled }"
                as="template">
                <li
                    class="relative flex cursor-pointer items-center rounded-sm py-2 pr-3 pl-8"
                    :class="[
                        active && !disabled
                            ? 'bg-primary text-white dark:bg-gray-100 dark:text-gray-700'
                            : '',
                        selected && !active
                            ? 'bg-gray-50 dark:bg-gray-100 dark:text-gray-900'
                            : '',
                    ]">
                    <span
                        class="truncate"
                        :class="selected ? 'font-semibold' : 'font-normal'">
                        {{ department[`name_${language}`] }}
                        <template v-if="department[`acronym_${language}`]">
                            ({{ department[`acronym_${language}`] }})
                        </template>
                    </span>
                    <span
                        class="absolute inset-y-0 left-0 flex items-center pl-3">
                        <Plus
                            class="size-4"
                            :class="[
                                active && !disabled
                                    ? 'text-white dark:text-gray-700'
                                    : '',
                                selected && !active ? 'dark:text-gray-900' : '',
                            ]" />
                    </span>
                </li>
            </ComboboxOption>
        </ComboboxOptions>
    </Combobox>
    <div v-if="selectedDepartments.length > 0">
        <ComparisonChart
            :departments="selectedDepartments"
            :highlighted-department-id="highlightedDepartmentId" />
        <div class="flex flex-col gap-4">
            <div
                class="flex flex-col gap-4 rounded-sm bg-gray-100 p-4 md:flex-row md:items-end md:justify-between dark:bg-gray-900">
                <div class="flex gap-2">
                    <div class="flex flex-col">
                        <label
                            for="year"
                            class="mb-1 font-semibold"
                            >{{ strings.department_year }}</label
                        >
                        <select
                            id="year"
                            class="cursor-pointer rounded-sm border border-solid border-gray-300 bg-white px-1 py-0.5 text-gray-700 focus-visible:outline-offset-4 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
                            v-model="selectedYear">
                            <option
                                v-for="year in availableYears"
                                :key="year"
                                :value="year">
                                {{ year }}
                            </option>
                        </select>
                    </div>
                    <div class="flex flex-col">
                        <label
                            v-if="isQuarterlyGranularity"
                            for="quarter"
                            class="mb-1 font-semibold"
                            >{{ strings.department_quarter }}</label
                        >
                        <select
                            v-if="isQuarterlyGranularity"
                            id="quarter"
                            class="cursor-pointer rounded-sm border border-solid border-gray-300 bg-white px-1 py-0.5 text-gray-700 focus-visible:outline-offset-4 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
                            v-model="selectedQuarter">
                            <option
                                v-for="quarter in quarterOptions"
                                :key="quarter.value"
                                :value="quarter.value"
                                :disabled="quarter.disabled">
                                {{ quarter.label }}
                            </option>
                        </select>
                    </div>
                </div>
                <label class="flex w-fit cursor-pointer">
                    <div class="pr-2 leading-none font-semibold">
                        {{ strings.comparison_show_all_departments_label }}
                    </div>
                    <SwitchRoot
                        v-model="showAllDepartments"
                        class="switch-primary focus-outline-primary relative flex h-[20px] w-[32px] cursor-pointer rounded-full border border-1 border-solid border-gray-100 shadow-sm transition-[background] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid data-[state=unchecked]:bg-gray-300 dark:data-[state=checked]:bg-gray-100 dark:data-[state=unchecked]:bg-gray-950">
                        <SwitchThumb
                            class="my-auto flex h-3.5 w-3.5 translate-x-0.5 items-center justify-center rounded-full bg-white text-xs shadow-xl transition-transform will-change-transform data-[state=checked]:translate-x-full dark:bg-gray-950 dark:data-[state=unchecked]:bg-gray-100" />
                    </SwitchRoot>
                </label>
            </div>
            <table
                class="block w-full border-separate border-spacing-y-0 md:table">
                <caption class="sr-only">
                    {{
                        strings.departments_table_caption
                    }}
                </caption>
                <thead class="hidden md:table-header-group">
                    <tr>
                        <th
                            scope="col"
                            class="border-b-1 border-solid border-gray-300 p-2 text-left font-semibold">
                            {{ strings.departments_table_department_column }}
                        </th>
                        <th
                            scope="col"
                            class="border-b-1 border-solid border-gray-300 p-2 font-semibold">
                            {{ strings.dep_indeterminate }}
                        </th>
                        <th
                            scope="col"
                            class="border-b-1 border-solid border-gray-300 p-2 font-semibold">
                            {{ strings.dep_term }}
                        </th>
                        <th
                            scope="col"
                            class="border-b-1 border-solid border-gray-300 p-2 font-semibold">
                            {{ strings.dep_student }}
                        </th>
                        <th
                            scope="col"
                            class="border-b-1 border-solid border-gray-300 p-2 font-semibold">
                            {{ strings.dep_casual }}
                        </th>
                        <th
                            scope="col"
                            class="border-b-1 border-solid border-gray-300 p-2 font-semibold">
                            {{ strings.total_label }}
                        </th>
                        <th
                            scope="col"
                            class="border-b-1 border-solid border-gray-300 p-2 font-semibold">
                            <span class="sr-only">{{
                                strings.departments_table_actions_column
                            }}</span>
                        </th>
                    </tr>
                </thead>
                <tbody class="block md:table-row-group">
                    <tr
                        v-if="allDepartmentsRow && showAllDepartments"
                        class="mb-4 block rounded-sm border-1 border-solid border-gray-300 p-2 font-semibold md:mb-0 md:table-row md:border-0 md:bg-gray-200 md:p-0 dark:border-gray-700 dark:bg-gray-800 md:dark:bg-gray-800">
                        <th
                            scope="row"
                            class="block p-2 text-left md:table-cell md:pl-3">
                            <span class="inline-flex items-center">
                                <span
                                    class="hidden md:size-2.5 md:shrink-0 md:rounded-full"
                                    aria-hidden="true" />
                                <span class="text-xl font-normal md:text-base">
                                    ({{
                                        allDepartmentsRow[`name_${language}`]
                                    }})
                                </span>
                            </span>
                        </th>
                        <td
                            class="block flex items-center justify-between p-2 text-center md:table-cell">
                            <span class="md:hidden">{{
                                strings.dep_indeterminate
                            }}</span>
                            <span class="text-right md:text-center">
                                {{
                                    numberFormatter(
                                        allDepartmentsValues?.indeterminate ||
                                            0,
                                    )
                                }}
                            </span>
                        </td>
                        <td
                            class="block flex items-center justify-between p-2 text-center md:table-cell">
                            <span class="md:hidden">{{
                                strings.dep_term
                            }}</span>
                            <span class="text-right md:text-center">
                                {{
                                    numberFormatter(
                                        allDepartmentsValues?.term || 0,
                                    )
                                }}
                            </span>
                        </td>
                        <td
                            class="block flex items-center justify-between p-2 text-center md:table-cell">
                            <span class="md:hidden">{{
                                strings.dep_student
                            }}</span>
                            <span class="text-right md:text-center">
                                {{
                                    numberFormatter(
                                        allDepartmentsValues?.student || 0,
                                    )
                                }}
                            </span>
                        </td>
                        <td
                            class="block flex items-center justify-between p-2 text-center md:table-cell">
                            <span class="md:hidden">{{
                                strings.dep_casual
                            }}</span>
                            <span class="text-right md:text-center">
                                {{
                                    numberFormatter(
                                        allDepartmentsValues?.casual || 0,
                                    )
                                }}
                            </span>
                        </td>
                        <td
                            class="block flex items-center justify-between p-2 text-center font-semibold md:table-cell">
                            <span class="md:hidden">{{
                                strings.total_label
                            }}</span>
                            <span class="text-right md:text-center">
                                {{ numberFormatter(allDepartmentsTotal) }}
                            </span>
                        </td>
                        <td class="hidden md:table-cell"></td>
                    </tr>
                    <SelectedDepartment
                        v-for="department in selectedDepartments"
                        :key="department.id"
                        :department="department"
                        :selected-quarter="
                            isQuarterlyGranularity ? selectedQuarter : null
                        "
                        :selected-year="selectedYear"
                        :highlighted="highlightedDepartmentId === department.id"
                        @remove-department="removeDepartment"
                        @highlight-department="
                            (id) => (highlightedDepartmentId = id)
                        "
                        @unhighlight-department="
                            (id) => {
                                if (highlightedDepartmentId === id)
                                    highlightedDepartmentId = null;
                            }
                        " />
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
    import { SwitchRoot, SwitchThumb } from "reka-ui";
    import { computed, onMounted, ref, watch } from "vue";
    import { storeToRefs } from "pinia";
    import { PageHeader } from "@/components/Shared";
    import SelectedDepartment from "./SelectedDepartment.vue";
    import ComparisonChart from "./ComparisonChart.vue";
    import numberFormatterMixin from "@/mixins/numberFormatter.js";
    import { ChevronsUpDown, Plus } from "lucide-vue-next";
    import { colors } from "@/assets/echarts/colors.json?json";
    import {
        Combobox,
        ComboboxButton,
        ComboboxInput,
        ComboboxOptions,
        ComboboxOption,
    } from "@headlessui/vue";
    import { useRoute, useRouter } from "vue-router";

    import useLocalizationsStore from "@/stores/localizations.js";
    const localizationsStore = useLocalizationsStore();
    const { language, strings } = storeToRefs(localizationsStore);

    import usePayloadStore from "@/stores/payloads.js";
    const payloadsStore = usePayloadStore();
    const { departments, composition } = storeToRefs(payloadsStore);

    import useSettingsStore from "@/stores/settings.js";
    const settingsStore = useSettingsStore();
    const {
        start_quarter,
        start_year,
        end_year,
        end_quarter,
        preferredGranularity,
    } = storeToRefs(settingsStore);
    const showAllDepartments = computed({
        get: () => settingsStore.showAllDepartments,
        set: (value) => settingsStore.setShowAllDepartments(value),
    });
    const route = useRoute();
    const router = useRouter();
    const cumulativeQueryKey = "cumulative";

    const selectedDepartment = ref(null);
    const numberFormatter = numberFormatterMixin.methods.numberFormatter;
    const selectedDepartmentMeta = ref([]);
    const highlightedDepartmentId = ref(null);
    const selectedQuarter = ref(end_quarter.value);
    const selectedYear = ref(end_year.value);
    const query = ref("");

    const availableYears = computed(() => {
        const years = [];

        for (let year = start_year.value; year <= end_year.value; year++) {
            years.push(year);
        }

        return years;
    });

    const quarterOptions = computed(() => {
        return [4, 3, 2, 1].map((quarter) => ({
            value: quarter,
            label: `Q${quarter}`,
            disabled:
                (selectedYear.value === start_year.value &&
                    quarter < start_quarter.value) ||
                (selectedYear.value === end_year.value &&
                    quarter > end_quarter.value),
        }));
    });

    const isQuarterlyGranularity = computed(
        () => preferredGranularity.value === "quarter",
    );

    const useDarkTheme = computed(
        () =>
            window.matchMedia &&
            window.matchMedia("(prefers-color-scheme: dark)").matches,
    );

    const selectedDepartments = computed(() => {
        if (!departments.value) return [];
        return selectedDepartmentMeta.value
            .map(({ id, color }) => {
                const dept = departments.value.find((d) => d.id === id);
                return dept ? { ...dept, color } : null;
            })
            .filter(Boolean);
    });

    const allDepartmentsRow = computed(() => {
        if (!composition.value) return null;

        return {
            id: "all-departments",
            name_en: strings.value.comparison_all_departments_label,
            name_fr: strings.value.comparison_all_departments_label,
            color: "#6b7280",
            ...composition.value,
        };
    });

    const allDepartmentsDataKey = computed(() => {
        const isQuarterly = preferredGranularity.value === "quarter";

        if (settingsStore.preferredMetric === "pop") {
            return isQuarterly
                ? "total_pops_per_quarter"
                : "total_pops_per_fiscal_year";
        }

        return isQuarterly
            ? "total_ftes_per_quarter"
            : "total_ftes_per_fiscal_year";
    });

    const allDepartmentsValues = computed(() => {
        if (!allDepartmentsRow.value) return null;

        const isQuarterly = preferredGranularity.value === "quarter";

        return allDepartmentsRow.value[allDepartmentsDataKey.value]?.find(
            (item) => {
                if (item.year !== selectedYear.value) {
                    return false;
                }

                if (!isQuarterly) {
                    return true;
                }

                return item.quarter === selectedQuarter.value;
            },
        );
    });

    const allDepartmentsTotal = computed(() => {
        if (!allDepartmentsValues.value) return 0;

        return (
            (allDepartmentsValues.value.indeterminate || 0) +
            (allDepartmentsValues.value.term || 0) +
            (allDepartmentsValues.value.student || 0) +
            (allDepartmentsValues.value.casual || 0)
        );
    });

    const filteredDepartments = computed(() => {
        if (departments.value === false) {
            return [];
        }

        const nameKey = `name_${language.value}`;
        const acronymKey = `acronym_${language.value}`;
        const trimmedQuery = query.value.trim().toLowerCase();

        const selectedIds = new Set(
            selectedDepartmentMeta.value.map(({ id }) => id),
        );

        const available = [...departments.value]
            .filter((department) => !selectedIds.has(department.id))
            .sort((a, b) => a[nameKey].localeCompare(b[nameKey]));

        if (!trimmedQuery) {
            return available;
        }

        return available.filter((department) => {
            const name = (department[nameKey] || "").toLowerCase();
            const acronym = (department[acronymKey] || "").toLowerCase();

            return (
                name.includes(trimmedQuery) || acronym.includes(trimmedQuery)
            );
        });
    });

    const displayDepartment = (department) => {
        if (!department) {
            return "";
        }

        return department[`name_${language.value}`] || "";
    };

    const removeDepartment = (departmentId) => {
        const remainingDepartments = selectedDepartmentMeta.value.filter(
            ({ id }) => id !== departmentId,
        );

        selectedDepartmentMeta.value = remainingDepartments;
    };

    const normalizeDepartmentIds = (rawIds) => {
        if (Array.isArray(rawIds)) {
            return rawIds.filter(Boolean);
        }

        return rawIds ? [rawIds].filter(Boolean) : [];
    };

    const idsAreEqual = (left, right) => {
        if (left.length !== right.length) {
            return false;
        }

        return left.every((id, index) => id === right[index]);
    };

    const buildDepartmentMetaFromIds = (ids) => {
        const colorPalette = useDarkTheme.value ? colors.dark : colors.light;

        return ids
            .map((id, index) => {
                const department = departments.value?.find((d) => d.id === id);
                if (!department) {
                    return null;
                }

                if (!department.eagerLoaded) {
                    payloadsStore.eagerLoadDepartment(department.id);
                }

                if (index >= colorPalette.length) {
                    index = 0;
                }

                return {
                    id,
                    color: colorPalette[index],
                };
            })
            .filter(Boolean);
    };

    watch(selectedDepartment, (department) => {
        if (!department) {
            return;
        }

        const alreadySelected = selectedDepartmentMeta.value.some(
            ({ id }) => id === department.id,
        );

        if (!alreadySelected) {
            let index = selectedDepartmentMeta.value.length;
            const colorPalette = useDarkTheme.value
                ? colors.dark
                : colors.light;
            if (index >= colorPalette.length) {
                index = 0;
            }
            selectedDepartmentMeta.value = [
                ...selectedDepartmentMeta.value,
                { id: department.id, color: colorPalette[index] },
            ];
            payloadsStore.eagerLoadDepartment(department.id);
        }

        selectedDepartment.value = null;
        query.value = "";
    });

    watch(
        selectedDepartmentMeta,
        (meta) => {
            const ids = meta.map(({ id }) => id);
            const routeIds = normalizeDepartmentIds(route.params.departments);

            if (!idsAreEqual(ids, routeIds)) {
                router.push({
                    name: "departments",
                    params: { departments: ids },
                    query: route.query,
                });
            }

            settingsStore.setPreviouslySelectedDepartmentIds(ids);
        },
        { deep: true },
    );

    watch(
        () => route.params.departments,
        (departmentParamIds) => {
            if (!departments.value) {
                return;
            }

            const routeIds = normalizeDepartmentIds(departmentParamIds);
            const currentIds = selectedDepartmentMeta.value.map(({ id }) => id);

            if (idsAreEqual(routeIds, currentIds)) {
                return;
            }

            selectedDepartmentMeta.value = buildDepartmentMetaFromIds(routeIds);
        },
    );

    watch(
        () => route.query[cumulativeQueryKey],
        (queryValue) => {
            const enabled = queryValue === "1";

            if (showAllDepartments.value !== enabled) {
                showAllDepartments.value = enabled;
            }
        },
        { immediate: true },
    );

    watch(showAllDepartments, async (enabled) => {
        const nextQuery = { ...route.query };

        if (enabled) {
            nextQuery[cumulativeQueryKey] = "1";
        } else {
            delete nextQuery[cumulativeQueryKey];
        }

        const queryAlreadyInSync =
            (enabled && route.query[cumulativeQueryKey] === "1") ||
            (!enabled && route.query[cumulativeQueryKey] === undefined);

        if (!queryAlreadyInSync) {
            router.replace({ query: nextQuery });
        }

        if (enabled && !composition.value) {
            await payloadsStore.fetchComposition();
        }
    });

    onMounted(async () => {
        await payloadsStore.fetchDepartments();

        if (showAllDepartments.value) {
            await payloadsStore.fetchComposition();
        }

        const routeDepartmentIds = normalizeDepartmentIds(
            route.params.departments,
        );

        if (!routeDepartmentIds.length) {
            return;
        }

        selectedDepartmentMeta.value =
            buildDepartmentMetaFromIds(routeDepartmentIds);
    });
</script>
