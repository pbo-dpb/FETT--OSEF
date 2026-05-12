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
            class="relative border bg-white shadow-sm"
            :class="
                open
                    ? 'border-gray-500'
                    : 'border-gray-300 hover:border-gray-400'
            ">
            <ComboboxInput
                class="w-full rounded-sm border border-solid border-gray-300 py-2 pr-12 pl-4 outline-offset-4"
                :displayValue="displayDepartment"
                :placeholder="
                    strings.departments_overview_no_departments_selected_message
                "
                @change="query = $event.target.value" />
            <ComboboxButton
                class="absolute inset-y-0 right-0 flex cursor-pointer items-center px-3"
                :aria-label="strings.departments_combobox_toggle_aria_label">
                <ChevronsUpDown class="size-4" />
            </ComboboxButton>
        </div>
        <ComboboxOptions
            class="absolute z-20 mt-2 max-h-48 w-full overflow-auto rounded-sm border border-solid border-gray-300 bg-white p-1 shadow-xl focus:outline-none">
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
                        active && !disabled ? 'bg-gray-900 text-white' : '',
                        selected && !active ? 'bg-gray-50' : '',
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
                        <Plus class="size-4" />
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
            <div class="flex rounded-sm bg-gray-100 p-4">
                <fieldset class="flex flex-col">
                    <legend class="mb-1 font-semibold">
                        {{ strings.department_fiscal_period_label }}
                    </legend>
                    <div class="flex gap-2">
                        <label
                            for="year"
                            class="sr-only"
                            >{{ strings.department_year }}</label
                        >
                        <select
                            id="year"
                            class="cursor-pointer rounded-sm border border-solid border-gray-300 bg-white py-0.5 focus-visible:outline-offset-4"
                            v-model="selectedYear">
                            <option
                                v-for="year in availableYears"
                                :key="year"
                                :value="year">
                                {{ year }}
                            </option>
                        </select>
                        <label
                            for="quarter"
                            class="sr-only"
                            >{{ strings.department_quarter }}</label
                        >
                        <select
                            id="quarter"
                            class="cursor-pointer rounded-sm border border-solid border-gray-300 bg-white py-0.5 focus-visible:outline-offset-4"
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
                </fieldset>
            </div>
            <table
                class="block w-full border-separate border-spacing-y-2 md:table">
                <caption class="sr-only">
                    {{
                        strings.departments_table_caption
                    }}
                </caption>
                <thead class="mb-4 hidden md:table-header-group">
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
                    <SelectedDepartment
                        v-for="department in selectedDepartments"
                        :key="department.id"
                        :department="department"
                        :selected-quarter="selectedQuarter"
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
    import { computed, onMounted, ref, watch } from "vue";
    import { storeToRefs } from "pinia";
    import PageHeader from "../Shared/UI/PageHeader.vue";
    import SelectedDepartment from "./SelectedDepartment.vue";
    import ComparisonChart from "./ComparisonChart.vue";
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
    const { departments } = storeToRefs(payloadsStore);

    import useSettingsStore from "@/stores/settings.js";
    const settingsStore = useSettingsStore();
    const { start_quarter, start_year, end_year, end_quarter } =
        storeToRefs(settingsStore);
    const route = useRoute();
    const router = useRouter();

    const selectedDepartment = ref(null);
    const selectedDepartmentMeta = ref([]); // [{ id, color }]
    const highlightedDepartmentId = ref(null);
    const selectedQuarter = ref(end_quarter.value);
    const selectedYear = ref(end_year.value);
    const query = ref("");

    const availableYears = computed(() => {
        const years = [];
        for (let year = end_year.value; year >= start_year.value; year--) {
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
        selectedDepartmentMeta.value = selectedDepartmentMeta.value.filter(
            ({ id }) => id !== departmentId,
        );
    };

    const normalizeDepartmentIds = (rawIds) => {
        if (Array.isArray(rawIds)) {
            return rawIds;
        }

        return rawIds ? [rawIds] : [];
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
            const index = selectedDepartmentMeta.value.length;
            const colorPalette = useDarkTheme.value
                ? colors.dark
                : colors.light;
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

    onMounted(async () => {
        await payloadsStore.fetchDepartments();

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
