<template>
    <div
        class="flex flex-col gap-8"
        v-if="departments !== false">
        <div>
            <h3 class="mb-4 text-2xl text-balance">
                {{ strings.comparison_heading }}
            </h3>
            <p>{{ strings.comparison_description }}</p>
        </div>
        <DepartmentsOverviewChart
            :departments="selectedDepartments"
            :highlighted-department-id="highlightedDepartmentId" />
        <div class="flex flex-col gap-4">
            <div class="flex justify-end">
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
                            class="rounded-sm border border-solid border-gray-300 py-0.5"
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
                            class="rounded-sm border border-solid border-gray-300 py-0.5"
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
            <div class="grid grid-cols-4 gap-4">
                <DepartmentPicker :selected-departments="selectedDepartments" />
                <div
                    v-if="selectedDepartments.length"
                    class="col-span-3 flex flex-row gap-8 overflow-x-scroll rounded-t-lg rounded-tl bg-slate-50 p-4 shadow-inner">
                    <PickedDepartment
                        v-for="department in selectedDepartments"
                        :key="department.id"
                        :department="department"
                        :selectedQuarter="selectedQuarter"
                        :selectedYear="selectedYear"
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
                </div>
            </div>
            <div
                v-if="!selectedDepartments.length"
                class="col-span-3 flex flex-col items-center justify-center gap-2 bg-slate-50 p-4 text-slate-500">
                <p class="text-lg font-medium">
                    {{
                        strings.departments_overview_no_departments_selected_message
                    }}
                </p>
                <ArrowBigLeft class="size-8" />
            </div>
        </div>
    </div>
    <div v-else>
        <LoadingIndicator class="size-6" />
    </div>
</template>
<script setup>
    import { computed, onMounted, ref, watch } from "vue";

    defineOptions({
        name: "DepartmentsView",
    });

    import { storeToRefs } from "pinia";

    import usePayloadsStore from "@/stores/payloads.js";
    const payloadsStore = usePayloadsStore();
    const { departments } = storeToRefs(payloadsStore);

    import useLocalizationsStore from "@/stores/localizations.js";
    const localizationStore = useLocalizationsStore();
    const { strings } = storeToRefs(localizationStore);

    import useSettingsStore from "@/stores/settings.js";
    const settingsStore = useSettingsStore();
    const { start_quarter, start_year, end_year, end_quarter } =
        storeToRefs(settingsStore);

    import DepartmentPicker from "./DepartmentPicker.vue";
    import LoadingIndicator from "@/components/Shared/UI/LoadingIndicator.vue";
    import DepartmentsOverviewChart from "./DepartmentsOverviewChart.vue";
    import PickedDepartment from "./PickedDepartment.vue";

    import { ArrowBigLeft } from "lucide-vue-next";
    import { colors } from "@/assets/echarts/colors.json?json";

    import { useRoute, useRouter } from "vue-router";
    const route = useRoute();
    const router = useRouter();

    const highlightedDepartmentId = ref(null);
    const selectedQuarter = ref(end_quarter.value);
    const selectedYear = ref(end_year.value);

    onMounted(() => {
        if (departments.value === false) {
            payloadsStore.fetchDepartments();
        }
    });

    const selectedDepartments = computed(() => {
        if (!departments.value) return [];

        const departmanetIds = route.params.departments || [];
        let index = 0;
        let useDarkTheme =
            window.matchMedia &&
            window.matchMedia("(prefers-color-scheme: dark)").matches;

        return departmanetIds
            .map((did) => {
                return departments.value.find((d) => d.id === did);
            })
            .filter((d) => (d ? true : false))
            .map((dpt) => {
                let dptx = {
                    ...dpt,
                    color: useDarkTheme
                        ? colors.dark[index]
                        : colors.light[index],
                };

                index++;
                return dptx;
            });
    });

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

    const removeDepartment = (departmentId) => {
        const newSelectedDepartments = selectedDepartments.value
            .map((dept) => dept.id)
            .filter((id) => id !== departmentId);

        router.push({
            name: "departments",
            params: { departments: newSelectedDepartments },
        });
    };

    watch(selectedDepartments, (newVal) => {
        newVal.forEach((department) => {
            if (!department.eagerLoaded) {
                payloadsStore.eagerLoadDepartment(department.id);
            }
        });

        settingsStore.setPreviouslySelectedDepartmentIds(
            newVal.map((d) => d.id) || [],
        );
    });

    watch(
        availableYears,
        (years) => {
            if (!years.length) {
                return;
            }

            if (!years.includes(selectedYear.value)) {
                selectedYear.value = years[0];
            }
        },
        { immediate: true },
    );

    watch(
        [selectedYear, start_year, start_quarter, end_year, end_quarter],
        () => {
            if (
                selectedYear.value === start_year.value &&
                selectedQuarter.value < start_quarter.value
            ) {
                selectedQuarter.value = start_quarter.value;
            } else if (
                selectedYear.value === end_year.value &&
                selectedQuarter.value > end_quarter.value
            ) {
                selectedQuarter.value = end_quarter.value;
            }
        },
        { immediate: true },
    );
</script>
