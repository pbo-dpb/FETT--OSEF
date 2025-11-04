<template>
  <DebugBar v-if="debug"></DebugBar>
  <div class="flex flex-col gap-8">

    <AboutAccordion />

    <Tabs />

    <RouterView />

  </div>
</template>

<script setup>
import { defineAsyncComponent, computed, onMounted, watch, getCurrentInstance } from 'vue'
import WrapperEventDispatcher from "./WrapperEventDispatcher.js"
import { storeToRefs } from 'pinia'
import useLocalizationsStore from './stores/localizations.js'
import AboutAccordion from './components/AboutAccordion.vue';
import Tabs from './components/Tabs.vue';

const DebugBar = defineAsyncComponent(() =>
  import("./components/DebugBar.vue")
);

const instance = getCurrentInstance()

const localizationsStore = useLocalizationsStore()
const { language, strings } = storeToRefs(localizationsStore)

const debug = computed(() => instance.proxy.$root.debug)

const setPageTitle = () => {
  (new WrapperEventDispatcher(strings.value.title, null)).dispatch();
}


onMounted(() => {
  setPageTitle();
})

watch(language, () => {
  setPageTitle();
})
</script>
<style>
@import "./index.css";
</style>
