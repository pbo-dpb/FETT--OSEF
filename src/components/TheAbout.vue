<template>
    <div
        v-if="formattedContent"
        class="prose dark:prose-invert prose-headings:mt-0 prose-headings:font-light prose-a:text-slate-800 dark:prose-a:text-slate-200 flex max-w-none flex-col">
        <div v-html="formattedContent"></div>

        <div class="mb-5 text-sm font-medium">
            {{ strings.last_updated }}{{ displayableLastUpdated }}
        </div>
    </div>
    <LoadingIndicator
        v-else
        class="size-8 py-4" />
</template>
<script setup>
    import { ref, computed } from "vue";
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

    const fetching = ref(false);
    const content = ref({
        en: null,
        fr: null,
    });

    // Computed
    const formattedContent = computed(() => {
        if (content.value[language.value]) {
            return marked.parse(content.value[language.value]);
        } else if (fetching.value !== language.value) {
            fetchContent(language.value);
        }
        return null;
    });

    const fetchContent = async (lang) => {
        fetching.value = lang;
        let url = lang === "en" ? introEn : introFr;

        const response = await fetch(url);
        let markdown = await response.text();
        content.value[lang] = markdown;
        fetching.value = null;
    };
</script>
