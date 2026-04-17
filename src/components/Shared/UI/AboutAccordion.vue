<template>
    <div
        class="rounded-sm border border-solid border-gray-300 shadow-sm">
        <h3
            class="flex flex-col p-4 dark:border-gray-900"
            :class="{'border-b-1 border-solid border-gray-300': !isExpanded}">
            <button
                :id="uid + '-header'"
                :aria-controls="uid + '-panel'"
                :aria-expanded="!isExpanded"
                @click="toggle"
                class="flex cursor-pointer flex-row items-center gap-2 font-semibold text-slate-800 dark:text-slate-100">
                <ChevronRight
                    class="h-6 w-6"
                    v-if="isExpanded"></ChevronRight>
                <ChevronDown
                    class="h-6 w-6"
                    v-else></ChevronDown>
                {{ strings.collapsible_component_handle_about }}
            </button>
        </h3>
        <section
            :id="uid + '-panel'"
            :aria-labelledby="uid + '-header'"
            :hidden="isExpanded"
            class="prose dark:prose-invert prose-headings:mt-0 prose-headings:font-light prose-a:text-slate-800 dark:prose-a:text-slate-200 max-w-none px-4">
            <div
                v-if="collapsibleContent"
                class="flex flex-col">
                <div v-html="collapsibleContent"></div>
                <div class="border-t border-solid py-4 text-sm">
                    <span class="font-medium">{{ strings.last_updated }}</span
                    >{{ displayableLastUpdated }}
                </div>
            </div>
            <LoadingIndicator
                class="size-8 py-4"
                v-else></LoadingIndicator>
        </section>
    </div>
</template>
<script setup>
    import { ref, computed, onMounted } from "vue";
    import { ChevronDown, ChevronRight } from "lucide-vue-next";
    import { storeToRefs } from "pinia";

    import introEn from "@/assets/intro.en.md?url";
    import introFr from "@/assets/intro.fr.md?url";

    import LoadingIndicator from "./LoadingIndicator.vue";
    import { marked } from "marked";

    import useLocalizationsStore from "@/stores/localizations.js";
    const localizationsStore = useLocalizationsStore();
    const { language, strings } = storeToRefs(localizationsStore);

    import useSettingStore from "@/stores/settings.js";
    const settingsStore = useSettingStore();
    const { last_updated } = storeToRefs(settingsStore);

    const displayableLastUpdated = computed(() => {
        return new Date(last_updated.value).toLocaleDateString(
            `${language.value}-CA`,
            {
                year: "numeric",
                month: "long",
                day: "numeric",
            },
        );
    });

    // Data
    const isExpanded = ref(true);
    const uid = ref(`collapsible-${Math.random().toString(36).slice(2, 7)}`);
    const fetching = ref(false);
    const content = ref({
        en: null,
        fr: null,
    });

    // Computed
    const collapsibleContent = computed(() => {
        if (content.value[language.value]) {
            return marked.parse(content.value[language.value]);
        } else if (fetching.value !== language.value) {
            fetchContent(language.value);
        }
        return null;
    });

    const localStorageKey = computed(() => {
        return `fcn-ncf.collapse.${last_updated}`;
    });

    // Methods
    const fetchContent = async (lang) => {
        fetching.value = lang;
        let url = lang === "en" ? introEn : introFr;

        const response = await fetch(url);
        let markdown = await response.text();
        content.value[lang] = markdown;
        fetching.value = null;
    };

    const toggle = () => {
        isExpanded.value = !isExpanded.value;
        try {
            if (isExpanded.value) {
                window.localStorage.setItem(localStorageKey.value, "TRUE");
            } else {
                window.localStorage.removeItem(localStorageKey.value);
            }
        } catch (error) {
            // Fail silently
        }
    };

    // Lifecycle
    onMounted(() => {
        try {
            const userPreference = window.localStorage.getItem(
                localStorageKey.value,
            );
            if (userPreference) {
                isExpanded.value = true;
            }
        } catch (error) {
            // Fail silently
        }
    });
</script>
