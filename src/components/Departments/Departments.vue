<template>
    <div
        class="flex flex-col gap-4"
        v-if="departments !== false">
        <div>
            <DepartmentsOverviewChart
                :departments="selectedDepartments"
                :highlighted-department-id="highlightedDepartmentId" />
        </div>
        <div class="grid grid-cols-4 gap-4">
            <DepartmentPicker :selected-departments="selectedDepartments" />

            <div
                v-if="selectedDepartments.length"
                class="col-span-3 flex flex-row gap-4 overflow-x-scroll rounded-t-lg rounded-tl bg-slate-50 p-4 shadow-inner">
                <PickedDepartment
                    v-for="department in selectedDepartments"
                    :key="department.id"
                    :department="department"
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
    import { computed, ref, watch } from "vue";

    import { storeToRefs } from "pinia";
    import { onMounted } from "vue";
    import usePayloadsStore from "../../stores/payloads.js";
    const payloadsStore = usePayloadsStore();
    const { departments } = storeToRefs(payloadsStore);
    import useLocalizationsStore from "../../stores/localizations.js";

    import useSettingStore from "../../stores/settings.js";
    const settingsStore = useSettingStore();

    const localizationStore = useLocalizationsStore();
    const { strings } = storeToRefs(localizationStore);
    import DepartmentPicker from "./DepartmentPicker.vue";
    import LoadingIndicator from "../LoadingIndicator.vue";
    import { useRoute, useRouter } from "vue-router";
    import PickedDepartment from "./PickedDepartment.vue";
    import { ArrowBigLeft } from "lucide-vue-next";
    import { colors } from "../../assets/colors.json?json";

    const route = useRoute();
    const router = useRouter();
    const highlightedDepartmentId = ref(null);
    import DepartmentsOverviewChart from "./DepartmentsOverviewChart.vue";

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
        settingsStore.setPreviouslySelectedDepartmentIds(
            newVal.map((d) => d.id) || [],
        );
    });
</script>
