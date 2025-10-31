<template>
  <DebugBar v-if="debug"></DebugBar>
  <div class="flex flex-col justify-center items-center gap-8">
    <img alt="PBO-DBP" :src="logoUrlComputed" class="w-64" />
    <ToolSplash />
  </div>
</template>

<script setup>
import { defineAsyncComponent, computed, onMounted, watch, getCurrentInstance } from 'vue'
import logoUrl from "./assets/logo.svg?url";
import ToolSplash from './components/ToolSplash.vue'
import WrapperEventDispatcher from "./WrapperEventDispatcher.js"
import { storeToRefs } from 'pinia'
import useLocalizationsStore from './stores/localizations.js'

const DebugBar = defineAsyncComponent(() =>
  import("./components/DebugBar.vue")
);

const instance = getCurrentInstance()

const localizationsStore = useLocalizationsStore()
const { language, strings } = storeToRefs(localizationsStore)

const logoUrlComputed = computed(() => logoUrl)
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
