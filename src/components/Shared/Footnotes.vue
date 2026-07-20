<template>
    <div
        class="col-span-full mt-8 flex flex-col gap-2 border-t border-solid pt-4">
        <p
            v-for="(footnote, index) in footnotes"
            :key="index"
            class="text-sm">
            {{ footnote }}
        </p>
    </div>
</template>

<script setup>
    defineProps(["footnotes"]);
</script>
