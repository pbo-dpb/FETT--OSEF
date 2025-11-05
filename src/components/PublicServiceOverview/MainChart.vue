<template>
    <div ref="componentRoot" class="w-full">
        <div :id="uniqueId" class="w-full h-128"></div>
    </div>
</template>
<script setup>
import { onMounted, onBeforeUnmount, useTemplateRef, shallowRef, computed, watch } from 'vue';
import { storeToRefs } from 'pinia'

import usePayloadsStore from '../../stores/payloads.js'
const payloadsStore = usePayloadsStore()
const { aggregations } = storeToRefs(payloadsStore)

import useLocalizationsStore from '../../stores/localizations.js'
const localizationsStore = useLocalizationsStore()
const { language, strings } = storeToRefs(localizationsStore)

import useSettingsStore from '../../stores/settings.js'
const settingsStore = useSettingsStore()
const { preferredTimeframe, preferredGranularity } = storeToRefs(settingsStore)

const uniqueId = `chart-${Math.random().toString(36).slice(2, 11)}`;
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
    LegendComponent,
    DataZoomComponent
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
    SVGRenderer,
    DataZoomComponent
]);

const dataZoom = computed(() => {
    let start = 0;
    let end = 100;

    let numberOfXAxisPoints = dataset.value.source.length;

    const oneYearGranularity = (preferredGranularity.value === 'month' ? 12 : 4);

    if (preferredTimeframe.value === '1Y') {
        start = 100 - oneYearGranularity / numberOfXAxisPoints * 100;
        end = 100;
    } else if (preferredTimeframe.value === '3Y') {
        start = 100 - (3 * oneYearGranularity) / numberOfXAxisPoints * 100;
        end = 100;
    } else if (preferredTimeframe.value === '5Y') {
        start = 100 - (5 * oneYearGranularity) / numberOfXAxisPoints * 100;
        end = 100;
    } else if (preferredTimeframe.value === '10Y') {
        start = 100 - (10 * oneYearGranularity) / numberOfXAxisPoints * 100;
        end = 100;
    } else if (preferredTimeframe.value === 'MAX') {
        start = 0;
        end = 100;
    }
    return {
        type: 'inside',
        start,
        end
    };
});

const dataset = computed(() => {

    let baseData = [];
    if (preferredGranularity.value === 'month') {
        baseData = aggregations.value.total_ftes_per_month;
    } else if (preferredGranularity.value === 'quarter') {
        baseData = aggregations.value.total_ftes_per_quarter;
    }

    return {
        dimensions: [
            'timestamp',
            'indeterminate',
            'term',
            'casual',
            'student'
        ],
        source: baseData.map(item => {

            return {
                timestamp: preferredGranularity.value === 'month' ? `${item.year}-${String(item.month).padStart(2, '0')}` : `${language.value === 'fr' ? 'T' : 'Q'}${item.quarter} ${item.year}`,
                indeterminate: item.indeterminate,
                term: item.term,
                casual: item.casual,
                student: item.student,
            }
        })
    };
});

const chartOptions = computed(() => {

    const baseSerie = {
        type: 'line',
        stack: 'Total',
        areaStyle: {},
        smooth: true,
        lineStyle: {
            width: 0
        },
        showSymbol: false
    }

    const options = {
        grid: {
            left: 0,
            right: 16,
        },
        dataZoom: [dataZoom.value],
        tooltip: {
            trigger: 'axis',
            /*axisPointer: {
                type: 'cross',
                label: {
                    backgroundColor: '#6a7985'
                }
            }*/
        },
        xAxis: {
            type: 'category',
        },
        yAxis: {
        },
        dataset: dataset.value,
        series: [
            {
                ...baseSerie,
                name: strings.value.indeterminate_label,
            },
            {
                ...baseSerie,
                name: strings.value.term_label,
            },
            {
                ...baseSerie,
                name: strings.value.casual_label,
            },
            {
                ...baseSerie,
                name: strings.value.student_label,
            },
        ]

    };

    options['legend'] = {
        data: options.series.map(serie => serie.name),
    }



    return options;
});

let chart = shallowRef(null);

onMounted(() => {

    if (aggregations.value === false) {
        throw new Error("Aggregations payload is required to render MainChart. Call 'fetchAggregations' action in payloads store before attempting to mount this component.");
    }

    let theme = null;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        theme = 'dark';
    }

    chart.value = echarts.init(componentRoot.value.querySelector(`#${uniqueId}`), theme, {
        renderer: 'svg',
        locale: language.value
    });


    chart.value.setOption(chartOptions.value);

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

const redrawChart = () => {
    chart.value.setOption(chartOptions.value);
};


watch([preferredTimeframe, preferredGranularity], () => {
    redrawChart();
});


</script>
