<template>
    <div class="grid grid-cols-4 gap-4">
        <div class="col-span-full flex justify-end gap-4">
            <span>[Show positions/FTEs] </span>
            <span>[Compare to previous year/quarter]</span>
        </div>
        <div
            class="col-span-full grid grid-cols-4 space-y-8 rounded-sm border border-solid border-gray-300 p-4">
            <div class="col-span-full text-center">
                <h2 class="mb-8 text-xl text-balance">
                    Size of the federal public service
                </h2>
                <p class="font-bold text-red-800">-1,500 positions (5.01%) ↓</p>
                <h3 class="text-sm">All positions</h3>
            </div>
            <div class="col-span-full text-center md:col-span-2 lg:col-span-1">
                <p class="font-bold text-red-800">-500 positions (1.92%) ↓</p>
                <h3 class="text-sm">Indeterminates</h3>
            </div>
            <div class="col-span-full text-center md:col-span-2 lg:col-span-1">
                <p class="font-bold text-green-800">
                    +2,500 positions (3.50%) ↑
                </p>
                <h3 class="text-sm">Term</h3>
            </div>
            <div class="col-span-full text-center md:col-span-2 lg:col-span-1">
                <p class="font-bold text-green-800">+375 positions (7.25%) ↑</p>
                <h3 class="text-sm">Student</h3>
            </div>
            <div class="col-span-full text-center md:col-span-2 lg:col-span-1">
                <p class="font-bold text-red-800">-140 positions (3.52%) ↓</p>
                <h3 class="text-sm">Casuals</h3>
            </div>
        </div>
        <div
            class="col-span-full flex flex-col space-y-4 rounded-sm border border-solid border-gray-300 p-4 md:col-span-2">
            <h2 class="mb-8 text-center text-xl text-balance">
                Largest increase by department
            </h2>
            <ol class="space-y-2">
                <li>
                    100 positions
                    <div class="text-sm">Shared Services Canada</div>
                </li>
                <li>
                    60 positions
                    <div class="text-sm">
                        Secretariat of the National Security and Intelligence
                        Committee of Parliamentarians
                    </div>
                </li>
                <li>
                    25 positions
                    <div class="text-sm">Indian Oil and Gas Canada</div>
                </li>
            </ol>
        </div>
        <div
            class="col-span-full flex flex-col space-y-4 rounded-sm border border-solid border-gray-300 p-4 md:col-span-2">
            <h2 class="mb-8 text-center text-xl text-balance">
                Largest decrease by department
            </h2>
            <ol class="space-y-2">
                <li>
                    100 positions
                    <div class="text-sm text-balance">
                        The Correctional Investigator Canada
                    </div>
                </li>
                <li>
                    60 positions
                    <div class="text-sm text-balance">
                        Federal Economic Development Agency for Northern Ontario
                    </div>
                </li>
                <li>
                    25 positions
                    <div class="text-sm text-balance">
                        National Security Intelligence and Review Agency
                    </div>
                </li>
            </ol>
        </div>
    </div>
</template>

<script setup>
    import { onMounted } from "vue";
    import { storeToRefs } from "pinia";
    import usePayloadsStore from "../../stores/payloads.js";

    const payloadsStore = usePayloadsStore();
    const { overview } = storeToRefs(payloadsStore);

    onMounted(async () => {
        if (overview.value === false) {
            await payloadsStore.fetchOverview();
        }

        console.log(JSON.parse(JSON.stringify(overview.value)));
    });
</script>
