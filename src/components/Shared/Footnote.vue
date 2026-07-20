<template>
    <div class="col-span-full mt-8 border-t border-solid pt-4">
        <p class="text-sm">{{ content }}</p>
    </div>
</template>

<script setup>
    defineProps(["content"]);
</script>
