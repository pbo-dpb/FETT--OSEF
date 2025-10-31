<template>
  <DebugBar v-if="debug"></DebugBar>
  <div class="flex flex-col justify-center items-center gap-8">
    <img alt="PBO-DBP" :src="logoUrl" class="w-64" />
    <ToolSplash />
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import logoUrl from "./assets/logo.svg?url";
import ToolSplash from './components/ToolSplash.vue'
import WrapperEventDispatcher from "./WrapperEventDispatcher.js"
import { mapState, mapWritableState } from 'pinia'
import Localizations from './stores/localizations.js'
const DebugBar = defineAsyncComponent(() =>
  import("./components/DebugBar.vue")
);

export default {
  computed: {
    logoUrl() {
      return logoUrl
    },
    ...mapWritableState(Localizations, ['language']),
    ...mapState(Localizations, ['strings']),
    debug() {
      return this.$root.debug;
    },
  },

  components: {
    ToolSplash,
    DebugBar
  },
  mounted() {
    this.setPageTitle();
  },
  methods: {
    setPageTitle() {
      (new WrapperEventDispatcher(this.strings.title, null)).dispatch();
    }
  },
  watch: {
    language() {
      this.setPageTitle();
    }
  }
};
</script>
<style>
@import "./index.css";
</style>
