<template>
    <section
        class="-mx-8 mb-16 flex flex-row items-center justify-between border-y border-gray-300 bg-gray-100 px-8 py-4 dark:bg-gray-950">
        <div class="text-center font-mono text-gray-800 dark:text-white">
            🔧 DEBUG
        </div>
        <BaseButton @click="language = language == 'en' ? 'fr' : 'en'">{{
            language == "en" ? "fr" : "en"
        }}</BaseButton>
    </section>
</template>

<script>
    import { mapWritableState } from "pinia";
    import BaseButton from "@/components/Shared/UI/BaseButton.vue";
    import Localizations from "@/stores/localizations.js";

    export default {
        computed: {
            ...mapWritableState(Localizations, ["language"]),
        },

        components: {
            BaseButton,
        },
    };
</script>
