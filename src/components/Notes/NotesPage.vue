<template>
    <div
        v-if="intro"
        class="flex flex-col">
        <div
            v-html="intro"
            class="prose prose-headings:text-gray-700 dark:prose-invert prose-headings:mt-0 prose-headings:font-light max-w-none"></div>
    </div>
</template>

<script setup>
    import { ref, computed } from "vue";
    import { storeToRefs } from "pinia";
    import { marked } from "marked";

    import useLocalizationsStore from "@/stores/localizations.js";

    import notesEn from "@/assets/markdown/notes.en.md?url";
    import notesFr from "@/assets/markdown/notes.fr.md?url";

    const localizationsStore = useLocalizationsStore();
    const { language } = storeToRefs(localizationsStore);

    const fetching = ref(false);
    const content = ref({
        en: null,
        fr: null,
    });

    const fetchContent = async (lang) => {
        fetching.value = lang;
        let url = lang === "en" ? notesEn : notesFr;

        const response = await fetch(url);
        let markdown = await response.text();
        content.value[lang] = markdown;
        fetching.value = null;
    };

    const intro = computed(() => {
        if (content.value[language.value]) {
            return marked.parse(content.value[language.value]);
        } else if (fetching.value !== language.value) {
            fetchContent(language.value);
        }
        return null;
    });
</script>
