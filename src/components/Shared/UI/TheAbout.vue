<template>
    <div
        v-if="about"
        class="flex flex-col">
        <div
            v-html="about"
            class="prose dark:prose-invert prose-headings:mt-0 prose-headings:font-normal prose-a:text-slate-800 dark:prose-a:text-slate-200 max-w-none"></div>
    </div>
</template>

<script setup>
    import { ref, computed } from "vue";
    import { storeToRefs } from "pinia";
    import { marked } from "marked";

    import aboutEn from "@/assets/markdown/about.en.md?url";
    import aboutFr from "@/assets/markdown/about.fr.md?url";

    import useLocalizationsStore from "@/stores/localizations.js";
    const localizationsStore = useLocalizationsStore();
    const { language } = storeToRefs(localizationsStore);

    const fetching = ref(false);
    const content = ref({
        en: null,
        fr: null,
    });

    const fetchContent = async (lang) => {
        fetching.value = lang;
        let url = lang === "en" ? aboutEn : aboutFr;

        const response = await fetch(url);
        let markdown = await response.text();
        content.value[lang] = markdown;
        fetching.value = null;
    };

    const about = computed(() => {
        if (content.value[language.value]) {
            return marked.parse(content.value[language.value]);
        } else if (fetching.value !== language.value) {
            fetchContent(language.value);
        }
        return null;
    });
</script>
