<template>
    <ScrollAreaRoot
        class="relative max-h-128 overflow-hidden rounded-lg border-2 border-solid transition-colors duration-150"
        :class="{
            'border-sky-100': currentlySelectedDepartmentIds.length,
            'border-sky-300': !currentlySelectedDepartmentIds.length,
        }"
        style="--scrollbar-size: 10px">
        <div
            class="absolute top-0 z-10 h-6 w-full bg-gradient-to-t from-transparent to-white" />
        <ScrollAreaViewport class="h-full w-full rounded">
            <div class="p-4">
                <div>
                    <input
                        type="search"
                        v-model="query"
                        class="mb-4 w-full rounded border border-solid border-slate-300 px-2 py-1"
                        :placeholder="strings.search_departments_placeholder" />
                </div>
                <component
                    :is="department.route ? 'RouterLink' : 'span'"
                    :to="department.route"
                    v-for="department in sortedDepartments"
                    :key="department.id"
                    class="group mt-2 flex flex-row items-center justify-between border-t border-solid border-slate-100 pt-2 text-xs text-sky-900 first:border-t-0"
                    :class="{
                        'group cursor-pointer hover:text-sky-700':
                            department.route,
                        'cursor-not-allowed opacity-50': !department.route,
                    }">
                    <span>{{ department.name }}</span>
                    <Plus
                        v-if="!department.active && department.route"
                        class="size-4 shrink-0 text-sky-700 opacity-0 group-hover:opacity-100"></Plus>
                    <CircleX
                        v-if="department.active"
                        class="hidden size-4 shrink-0 text-red-700 group-hover:block">
                    </CircleX>
                    <Check
                        v-if="department.active"
                        class="block size-4 shrink-0 text-green-700 group-hover:hidden">
                    </Check>
                </component>
            </div>
        </ScrollAreaViewport>
        <ScrollAreaScrollbar
            class="z-20 w-3 touch-none bg-white p-0.5 transition-colors duration-150 ease-out select-none hover:bg-slate-100"
            orientation="vertical">
            <ScrollAreaThumb class="flex-1 rounded-sm bg-slate-500" />
        </ScrollAreaScrollbar>

        <div
            class="absolute bottom-0 z-10 h-6 w-full bg-gradient-to-b from-transparent to-white" />
    </ScrollAreaRoot>
</template>
<script setup>
    import { Check, CircleX, Plus } from "lucide-vue-next";

    import Fuse from "fuse.js";
    import {
        ScrollAreaRoot,
        ScrollAreaScrollbar,
        ScrollAreaThumb,
        ScrollAreaViewport,
    } from "reka-ui";

    import { storeToRefs } from "pinia";
    import usePayloadsStore from "../../stores/payloads.js";
    import useLocalizationsStore from "../../stores/localizations.js";
    import { ref, computed } from "vue";
    const payloadsStore = usePayloadsStore();
    const { departments } = storeToRefs(payloadsStore);
    const localizationStore = useLocalizationsStore();
    const { language, strings } = storeToRefs(localizationStore);
    import { useRoute } from "vue-router";
    const route = useRoute();

    const query = ref("");

    const props = defineProps({
        selectedDepartments: {
            type: Array,
            required: true,
        },
    });

    const currentlySelectedDepartmentIds = computed(() => {
        return props.selectedDepartments.map((dept) => dept.id);
    });

    const deptToListableObject = (dept) => {
        const isCurrentlySelected =
            currentlySelectedDepartmentIds.value.includes(dept.id);

        let route;
        if (isCurrentlySelected) {
            route = {
                name: "departments",
                params: {
                    departments: currentlySelectedDepartmentIds.value.filter(
                        (id) => id !== dept.id,
                    ),
                },
            };
        } else if (currentlySelectedDepartmentIds.value.length >= 10) {
            route = null;
        } else {
            const newSelectedDepartments = [
                ...currentlySelectedDepartmentIds.value,
                dept.id,
            ];
            route = {
                name: "departments",
                params: { departments: newSelectedDepartments },
            };
        }

        return {
            name: dept[`name_${language.value}`],
            acronym: dept[`acronym_${language.value}`],
            id: dept.id,
            route: route,
            active: isCurrentlySelected,
        };
    };

    const sortedDepartments = computed(() => {
        if (departments.value === false) {
            return [];
        }

        if (query.value.trim()) {
            const fuse = new Fuse(
                departments.value.map((dept) => deptToListableObject(dept)),
                {
                    keys: ["name", "acronym"],
                },
            );

            return fuse.search(query.value).map((result) => result.item);
        }

        return [...departments.value]
            .sort((a, b) =>
                a[`name_${language.value}`].localeCompare(
                    b[`name_${language.value}`],
                ),
            )
            .map((dept) => deptToListableObject(dept));
    });
</script>
