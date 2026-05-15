<template>
    <span v-if="datapoint > 0">↑</span>
    <span v-else-if="datapoint < 0">↓</span>
    <span v-else>-</span>
</template>

<script setup>
    defineProps({
        datapoint: {
            type: String,
        },
    });
</script>
