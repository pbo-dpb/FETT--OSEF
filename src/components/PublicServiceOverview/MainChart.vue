<template>
    <div ref="componentRoot" class="w-full">
        <div :id="uniqueId" class="w-full h-128"></div>
    </div>

</template>
<script setup>
import { onMounted, onBeforeUnmount, useTemplateRef, shallowRef } from 'vue';
import { storeToRefs } from 'pinia'


import useLocalizationsStore from '../../stores/localizations.js'
const localizationsStore = useLocalizationsStore()
const { language, strings } = storeToRefs(localizationsStore)

const uniqueId = `chart-${Math.random().toString(36).substr(2, 9)}`;
const componentRoot = useTemplateRef('componentRoot');
const resObserver = shallowRef(null);

import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { LabelLayout, UniversalTransition } from 'echarts/features';
import { SVGRenderer } from 'echarts/renderers';
import darkTheme from "../../assets/echarts/dark.json?json"

echarts.registerTheme('dark', darkTheme);

import {
    TooltipComponent,
    GridComponent,
    DatasetComponent,
    TransformComponent,
    LegendComponent
} from 'echarts/components';

echarts.use([
    LineChart,
    TooltipComponent,
    GridComponent,
    DatasetComponent,
    TransformComponent,
    LegendComponent,
    LabelLayout,
    UniversalTransition,
    SVGRenderer
]);


let chart = shallowRef(null);

onMounted(() => {

    let theme = null;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        theme = 'dark';
    }
    chart.value = echarts.init(componentRoot.value.querySelector(`#${uniqueId}`), theme, {
        renderer: 'svg',
        locale: language.value
    });

    const options = {
        grid: {
            left: 0,
            right: 0,
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross',
                label: {
                    backgroundColor: '#6a7985'
                }
            }
        },
        legend: {
            data: ['Email']
        },
        xAxis: {
            type: 'category',
            data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        },
        yAxis: {
            type: 'value'
        },
        series: [
            {
                data: [150, 230, 224, 218, 135, 147, 260],
                type: 'line',
                name: 'Email',
            }
        ]
    };

    chart.value.setOption(options);

    resObserver.value = new ResizeObserver(() => {
        if (chart.value) {
            chart.value.resize()
        }
    }).observe(componentRoot.value.querySelector(`#${uniqueId}`));
    window.globalchart = chart.value;
});

onBeforeUnmount(() => {
    if (chart.value) {
        chart.value.dispose();
        chart.value = null;
    }
    if (resObserver.value) {
        resObserver.value.disconnect();
        resObserver.value = null;
    }
});

</script>
