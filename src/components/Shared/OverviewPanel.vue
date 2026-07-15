<template>
    <div
        class="col-span-full flex flex-col space-y-4 rounded-sm border border-solid border-gray-300 p-4 md:col-span-2">
        <h3 class="mb-8 text-center text-2xl text-balance">
            {{ header }}
        </h3>
        <ol class="space-y-2">
            <li
                v-for="department in departmentsList"
                :key="department.department_id">
                <h4 class="font-semibold">
                    {{ displayDepartmentName(department) }}
                    <span
                        v-if="
                            department.department_acronym_en ||
                            department.department_acronym_fr
                        "
                        >({{ displayDepartmentAcronym(department) }})</span
                    >
                </h4>
                <div>
                    <span
                        >{{ useNumberFormatter(department.absoluteDiff) }}
                    </span>
                    ({{ useNumberFormatter(department.relativeDiff, true) }}%)
                    <TrendIndicator :datapoint="department.absoluteDiff" />
                </div>
            </li>
        </ol>
        <div class="col-span-full text-right text-xs font-semibold">
            {{ deltaDataLabel }}
        </div>
    </div>
</template>

<script setup>
    import { storeToRefs } from "pinia";
    import useLocalizationsStore from "@/stores/localizations.js";
    import { useNumberFormatter } from "@/composables/useNumberFormatter.js";
    import TrendIndicator from "@/components/Shared/TrendIndicator.vue";

    const localizationsStore = useLocalizationsStore();
    const { language } = storeToRefs(localizationsStore);

    defineProps(["header", "departmentsList", "deltaDataLabel"]);

    const displayDepartmentName = (department) => {
        return language.value === "fr"
            ? department.department_name_fr
            : department.department_name_en;
    };

    const displayDepartmentAcronym = (department) => {
        return language.value === "fr"
            ? department.department_acronym_fr
            : department.department_acronym_en;
    };
</script>
