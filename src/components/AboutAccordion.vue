<template>
    <div
        class="border border-solid border-purple-100 rounded-sm dark:border-purple-900 shadow-sm"
    >
        <h3
            class="p-4 border-b border-solid border-purple-100 dark:border-purple-900 flex flex-col"
        >
            <button
                :id="uid + '-header'"
                :aria-controls="uid + '-panel'"
                :aria-expanded="!shouldCollapse"
                @click="toggle"
                class="flex flex-row gap-2 items-center text-slate-800 dark:text-slate-100 font-semibold cursor-pointer"
            >
                <ChevronRight
                    class="w-6 h-6"
                    v-if="shouldCollapse"
                ></ChevronRight>
                <ChevronDown class="w-6 h-6" v-else></ChevronDown>
                {{ strings.collapsible_component_handle }}
            </button>
        </h3>
        <section
            :id="uid + '-panel'"
            :aria-labelledby="uid + '-header'"
            :hidden="shouldCollapse"
            class="px-4 prose dark:prose-invert max-w-none prose-headings:mt-0 prose-headings:font-light prose-a:text-slate-800 dark:prose-a:text-slate-200"
        >
            <div v-if="collapsibleContent" class="flex flex-col">
                <div v-html="collapsibleContent"></div>

                <div class="font-medium text-sm mb-5">
                    {{ strings.last_updated }}{{ displayableLastUpdated }}
                </div>
            </div>
            <LoadingIndicator class="size-8 py-4" v-else></LoadingIndicator>
        </section>
    </div>
</template>
<script></script>
<script setup>
import { ref, computed, onMounted } from "vue";
import { ChevronDown, ChevronRight } from "lucide-vue-next";
import { storeToRefs } from "pinia";

import introEn from "../assets/intro.en.md?url";
import introFr from "../assets/intro.fr.md?url";

import LoadingIndicator from "./LoadingIndicator.vue";
import { marked } from "marked";

import useLocalizationsStore from "../stores/localizations.js";
const localizationsStore = useLocalizationsStore();
const { language, strings } = storeToRefs(localizationsStore);

import useSettingStore from "../stores/settings.js";
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
const shouldCollapse = ref(false);
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
    shouldCollapse.value = !shouldCollapse.value;
    try {
        if (shouldCollapse.value) {
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
            shouldCollapse.value = true;
        }
    } catch (error) {
        // Fail silently
    }
});
</script>
