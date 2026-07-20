<template>
    <div
        class="col-span-full flex flex-col space-y-4 rounded-sm border border-solid border-gray-300 p-4 md:col-span-2">
        <h3 class="mb-2 text-center text-2xl text-balance">
            {{ header }}
        </h3>
        <div class="col-span-full mb-8 text-center text-balance">
            {{ metric }}
        </div>
        <slot></slot>
    </div>
</template>
<script setup>
    defineProps(["header", "metric"]);
</script>
