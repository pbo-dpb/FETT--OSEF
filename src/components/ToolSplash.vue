<template>
  <Button v-if="!payload" type="primary" @click="loadPayload" :loading="loading">{{ strings.cta }}</Button>
  <figure v-else class="flex flex-col gap-4 text-monospace">
    {{ strings.message }}
    <div class="flex flex-row justify-between gap-4">
      <div v-for="item in payload" class="text-2xl">{{ item }}</div>
    </div>
  </figure>
</template>
<script>
import payloadUrl from "../assets/payload.json?url";
import WrapperEventDispatcher from "../WrapperEventDispatcher";
import Button from "./Button.vue";
import { mapState } from 'pinia'
import Localizations from '../stores/localizations.js'

export default {
  components: {
    Button
  },
  data() {
    return {
      payload: null,
      loading: false
    }
  },
  computed: {
    ...mapState(Localizations, ['strings']),
  },
  methods: {
    loadPayload() {
      this.loading = true;

      fetch(payloadUrl)
        .then((r) => r.json())
        .then((p) => {

          setTimeout(() => {
            this.loading = false;
            this.payload = p
            WrapperEventDispatcher.dispatch(null, [{ name: this.strings.message }]);
          }, 1000)

        });
    }
  }
};
</script>
