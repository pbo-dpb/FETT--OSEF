<template>
    <div
        v-if="about"
        class="flex flex-col gap-5">
        <div
            v-html="about"
            class="prose dark:prose-invert prose-headings:mt-0 prose-headings:font-normal max-w-none"></div>
        <div class="border-t border-solid py-5 text-sm">
            <span class="font-semibold">{{ strings.last_updated }}</span
            >{{ displayableLastUpdated }}
        </div>
    </div>
</template>

<script setup>
    import { ref, computed } from "vue";
    import { storeToRefs } from "pinia";
    import { marked } from "marked";

    import useSettingStore from "@/stores/settings.js";
    import useLocalizationsStore from "@/stores/localizations.js";

    import aboutEn from "@/assets/markdown/about.en.md?url";
    import aboutFr from "@/assets/markdown/about.fr.md?url";

    const settingsStore = useSettingStore();
    const localizationsStore = useLocalizationsStore();

    const { language, strings } = storeToRefs(localizationsStore);
    const { last_updated } = storeToRefs(settingsStore);

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

    const displayableLastUpdated = computed(() => {
        return new Date(last_updated.value).toLocaleDateString(
            `${language.value}-CA`,
            {
                year: "numeric",
                month: "long",
                day: "numeric",
                timeZone: "UTC",
            },
        );
    });
</script>
