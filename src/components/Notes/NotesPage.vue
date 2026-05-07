<template>
    <div
        v-if="intro"
        class="flex flex-col">
        <div
            v-html="intro"
            class="prose prose-headings:text-gray-700 dark:prose-invert prose-headings:mt-0 prose-headings:font-light max-w-none"></div>
        <div class="mt-4 border-t border-solid py-4 text-sm">
            <span class="font-medium">{{ strings.last_updated }}</span
            >{{ displayableLastUpdated }}
        </div>
    </div>
</template>

<script setup>
    import { ref, computed } from "vue";
    import { storeToRefs } from "pinia";
    import { marked } from "marked";

    import notesEn from "@/assets/markdown/notes.en.md?url";
    import notesFr from "@/assets/markdown/notes.fr.md?url";

    import useLocalizationsStore from "@/stores/localizations.js";
    const localizationsStore = useLocalizationsStore();
    const { language, strings } = storeToRefs(localizationsStore);

    import useSettingStore from "@/stores/settings.js";
    const settingsStore = useSettingStore();
    const { last_updated } = storeToRefs(settingsStore);

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
</script>
