<template>
    <div>
        <h2 class="mb-4 text-2xl">
            {{ heading }}
        </h2>
        <p>{{ description }}</p>
    </div>
</template>
<script setup>
    defineProps({
        heading: String,
        description: String,
    });
</script>
