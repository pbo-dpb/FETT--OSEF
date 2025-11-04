<script setup>
import MainChart from './MainChart.vue';

</script>

<template>


    <div class="flex flex-col lg:grid grid-cols-5 gap-4">

        <div class="w-full lg:col-span-3">
            <MainChart />
        </div>
        <div class="w-full lg:col-span-2">
            Insights Panel
        </div>

    </div>

</template>