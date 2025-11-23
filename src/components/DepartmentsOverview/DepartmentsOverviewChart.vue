<template>
    <div ref="componentRoot" class="w-full flex flex-col gap-2" :class="{
        'blur': !departments.length
    }">
        <div v-show="departments.length" :id="uniqueId" class="w-full h-[40vh]"></div>
        <img v-show="!departments.length" :src="departmentsOverviewPlaceholderUrl" alt=""
            style="aspect-ratio: 1470/364;" />
    </div>
</template>
<script setup>
import { onMounted, onBeforeUnmount, useTemplateRef, shallowRef, computed, watch, ref } from 'vue';
import departmentsOverviewPlaceholderUrl from '../../assets/departments-overview-placeholder.svg?url';

const props = defineProps({
    departments: {
        type: Array,
        required: true
    },
})

import { storeToRefs } from 'pinia'
import useLocalizationsStore from '../../stores/localizations.js'
const localizationsStore = useLocalizationsStore()
const { language, strings } = storeToRefs(localizationsStore)

import useSettingsStore from '../../stores/settings.js'
const settingsStore = useSettingsStore()
const { preferredTimeframe, preferredGranularity } = storeToRefs(settingsStore)

import usePayloadsStore from '../../stores/payloads.js'
const payloadsStore = usePayloadsStore()

const uniqueId = `chart-${Math.random().toString(36).slice(2, 11)}`;
const componentRoot = useTemplateRef('componentRoot');
const resObserver = shallowRef(null);
let chart = shallowRef(null);
const useDarkTheme = ref(false);

import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { LabelLayout, UniversalTransition } from 'echarts/features';
import { SVGRenderer } from 'echarts/renderers';
import { colors } from "../../assets/colors.json?json"


import darkTheme from "../../assets/echarts/dark.json?json"
darkTheme['color'] = colors.dark;
darkTheme['graph']['color'] = colors.dark;
echarts.registerTheme('dark', darkTheme);
import lightTheme from "../../assets/echarts/light.json?json"
lightTheme['color'] = colors.light;
lightTheme['graph']['color'] = colors.light;
echarts.registerTheme('light', lightTheme);

import {
    TooltipComponent,
    GridComponent,
    DatasetComponent,
    TransformComponent,
    LegendComponent,
    DataZoomComponent,
    MarkAreaComponent,
    AriaComponent
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
    DataZoomComponent,
    MarkAreaComponent,
    AriaComponent
]);




const dataset = computed(() => {

    if (props.departments.filter(dept => !dept.eagerLoaded).length) {
        return { source: [] };
    }

    let dimensions = [
        'timestamp'
    ].filter(Boolean);

    props.departments.forEach(dept => {
        dimensions.push(dept[`name_${language.value}`]);
    });

    let timestamps = [];
    let deptPoints = {};

    let firstDept = props.departments[0];

    if (!firstDept || !firstDept.eagerLoaded) {
        return { source: [] };
    }

    if (preferredGranularity.value === 'month') {
        firstDept.total_ftes_per_month.forEach(item => {
            timestamps.push(`${item.year}-${String(item.month).padStart(2, '0')}`);

            // Load corresponding data points for each department
            props.departments.forEach((dept) => {
                if (!deptPoints[dept[`name_${language.value}`]]) {
                    deptPoints[dept[`name_${language.value}`]] = {};
                }
                const monthData = dept.total_ftes_per_month.find(d => d.year === item.year && d.month === item.month);
                deptPoints[dept[`name_${language.value}`]][`${item.year}-${String(item.month).padStart(2, '0')}`] = monthData ? Math.round(monthData.indeterminate) : 0;
            });

        });
    } else if (preferredGranularity.value === 'quarter') {
        firstDept.total_ftes_per_quarter.forEach(item => {
            timestamps.push(`${language.value === 'fr' ? 'T' : 'Q'}${item.quarter} ${item.year}`);
        });

        // Load corresponding data points for each department
        props.departments.forEach((dept) => {
            if (!deptPoints[dept[`name_${language.value}`]]) {
                deptPoints[dept[`name_${language.value}`]] = {};
            }

            dept.total_ftes_per_quarter.forEach(item => {
                deptPoints[dept[`name_${language.value}`]][`${language.value === 'fr' ? 'T' : 'Q'}${item.quarter} ${item.year}`] = Math.round(item.indeterminate + item.term + item.casual + item.student + item.combined);
            });
        });


    }

    return {
        dimensions: dimensions,
        source: timestamps.map(timestamp => {
            let dataPoint = { timestamp: timestamp };
            props.departments.forEach(dept => {
                dataPoint[dept[`name_${language.value}`]] = deptPoints[dept[`name_${language.value}`]][timestamp] || 0;
            });
            return dataPoint;
        })
    }


});


const series = computed(() => {

    const baseSerie = {
        type: 'line',
        smooth: true,
        lineStyle: {
            width: 4
        },
        showSymbol: false
    };

    let series = [];

    props.departments.forEach(dept => {
        if (!dept.eagerLoaded) {
            return;
        }
        series.push({
            ...baseSerie,
            name: dept[`name_${language.value}`],
        });
    });


    return series;
})

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


const chartOptions = computed(() => {

    const options = {
        grid: {
            left: 0,
            right: 16,
            bottom: 0,
            top: 0
        },
        dataZoom: [],
        tooltip: {
            trigger: 'axis',
        },
        xAxis: {
            type: 'category',
        },
        yAxis: {
        },
        series: series.value,
        dataset: dataset.value,
    };

    /*options['legend'] = {
        data: options.series.map(serie => serie.name),
    }*/

    return options;
});

onMounted(() => {
    let theme = null;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        theme = 'dark';
        useDarkTheme.value = true;
    } else {
        theme = 'light';
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

    // Sync departments
    syncDepartments();
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

const syncDepartments = () => {
    props.departments.forEach(dept => {
        if (!dept.eagerLoaded) {
            // Fetch eager loaded data for the department
            payloadsStore.eagerLoadDepartment(dept.id).then(() => {
                redrawChart();
            });
        }
    });
}

watch(() => props.departments, (newDeptList, oldDeptList) => {

    if (newDeptList.length <= oldDeptList.length) {
        // Department removed
        redrawChart();
    } else {
        // Department added
        redrawChart();
        syncDepartments();
    }
});

</script>