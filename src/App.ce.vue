<template>
    <DebugBar v-if="debug"></DebugBar>
    <div class="flex flex-col gap-8">
        <TheAbout />
        <Tabs />
        <RouterView />
    </div>
</template>

<script setup>
    import { computed, onMounted, watch, getCurrentInstance } from "vue";
    import WrapperEventDispatcher from "./WrapperEventDispatcher.js";
    import { storeToRefs } from "pinia";
    import useLocalizationsStore from "./stores/localizations.js";
    import { DebugBar, TheAbout, Tabs } from "@/components/Shared";

    const instance = getCurrentInstance();

    const localizationsStore = useLocalizationsStore();
    const { language, strings } = storeToRefs(localizationsStore);

    const debug = computed(() => instance.proxy.$root.debug);

    const setPageTitle = () => {
        new WrapperEventDispatcher(strings.value.title, null).dispatch();
    };

    onMounted(() => {
        setPageTitle();
    });

    watch(language, () => {
        setPageTitle();
    });
</script>

<style>
    @import "./index.css";
</style>
