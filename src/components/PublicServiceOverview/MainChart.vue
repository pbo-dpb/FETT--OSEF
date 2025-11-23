<template>
    <div ref="componentRoot" class="w-full flex flex-col gap-2">
        <div :id="uniqueId" class="w-full h-[80vh]"></div>


        <div class="flex xl:flex-row items-center gap-4 justify-end">


            <label class="flex gap-2 items-center rounded p-2 bg-slate-100 border-solid w-fit self-end">
                <div class="text-stone-700 dark:text-white leading-none pr-2 select-none text-xs font-medium">
                    {{ strings.display_yearly_averages_label }}
                </div>
                <SwitchRoot id="airplane-mode" v-model="shouldDisplayYearlyAverages"
                    class="w-[32px] h-[20px] shadow-sm flex data-[state=unchecked]:bg-stone-300 data-[state=checked]:bg-stone-800 dark:data-[state=unchecked]:bg-stone-800 dark:data-[state=checked]:bg-stone-700 border border-stone-300 data-[state=checked]:border-stone-700  dark:border-stone-700 rounded-full relative transition-[background] focus-within:outline-none focus-within:shadow-[0_0_0_1px] focus-within:border-stone-800 focus-within:shadow-stone-800">
                    <SwitchThumb
                        class="w-3.5 h-3.5 my-auto bg-white text-xs flex items-center justify-center shadow-xl rounded-full transition-transform translate-x-0.5 will-change-transform data-[state=checked]:translate-x-full" />
                </SwitchRoot>
            </label>



            <label class="flex gap-2 items-center rounded p-2 bg-slate-100 border-solid w-fit self-end">
                <div class="text-stone-700 dark:text-white leading-none pr-2 select-none text-xs font-medium">
                    {{ strings.include_combined_data_label }}
                </div>
                <SwitchRoot id="airplane-mode" v-model="shouldIncludeCombinedData"
                    class="w-[32px] h-[20px] shadow-sm flex data-[state=unchecked]:bg-stone-300 data-[state=checked]:bg-stone-800 dark:data-[state=unchecked]:bg-stone-800 dark:data-[state=checked]:bg-stone-700 border border-stone-300 data-[state=checked]:border-stone-700  dark:border-stone-700 rounded-full relative transition-[background] focus-within:outline-none focus-within:shadow-[0_0_0_1px] focus-within:border-stone-800 focus-within:shadow-stone-800">
                    <SwitchThumb
                        class="w-3.5 h-3.5 my-auto bg-white text-xs flex items-center justify-center shadow-xl rounded-full transition-transform translate-x-0.5 will-change-transform data-[state=checked]:translate-x-full" />
                </SwitchRoot>
            </label>

            <label class="flex gap-2 items-center rounded p-2 bg-slate-100 border-solid w-fit self-end">
                <div class="text-stone-700 dark:text-white leading-none pr-2 select-none text-xs font-medium">
                    {{ strings.should_split_by_tenure_label }}
                </div>
                <SwitchRoot id="airplane-mode" v-model="shouldSplitByTenure"
                    class="w-[32px] h-[20px] shadow-sm flex data-[state=unchecked]:bg-stone-300 data-[state=checked]:bg-stone-800 dark:data-[state=unchecked]:bg-stone-800 dark:data-[state=checked]:bg-stone-700 border border-stone-300 data-[state=checked]:border-stone-700  dark:border-stone-700 rounded-full relative transition-[background] focus-within:outline-none focus-within:shadow-[0_0_0_1px] focus-within:border-stone-800 focus-within:shadow-stone-800">
                    <SwitchThumb
                        class="w-3.5 h-3.5 my-auto bg-white text-xs flex items-center justify-center shadow-xl rounded-full transition-transform translate-x-0.5 will-change-transform data-[state=checked]:translate-x-full" />
                </SwitchRoot>
            </label>



        </div>
    </div>
</template>
<script setup>
import { SwitchRoot, SwitchThumb } from 'reka-ui'
import { onMounted, onBeforeUnmount, useTemplateRef, shallowRef, computed, watch, ref } from 'vue';
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

const shouldIncludeCombinedData = ref(false);
const shouldSplitByTenure = ref(true);
const shouldDisplayYearlyAverages = ref(false);
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
/*import lightTheme from "../../assets/echarts/light.json?json"
lightTheme['color'] = colors.light;
lightTheme['graph']['color'] = colors.light;
echarts.registerTheme('light', lightTheme);*/

import {
    TooltipComponent,
    GridComponent,
    DatasetComponent,
    TransformComponent,
    LegendComponent,
    DataZoomComponent,
    MarkAreaComponent
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
    MarkAreaComponent
]);

const baseData = computed(() => {
    if (preferredGranularity.value === 'month') {
        return aggregations.value.total_ftes_per_month;
    } else if (preferredGranularity.value === 'quarter') {
        return aggregations.value.total_ftes_per_quarter;
    }
    return [];
});


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

    let dimensions = [
        'indeterminate',
        'term',
        'casual',
        'student',
        shouldIncludeCombinedData.value ? 'combined' : null
    ].filter(Boolean);


    const arrayMapForTotalFtesInYear = {};
    if (shouldDisplayYearlyAverages.value) {
        aggregations.value.total_ftes_per_fiscal_year.forEach(item => {
            if (arrayMapForTotalFtesInYear[item.year] === undefined) {
                arrayMapForTotalFtesInYear[item.year] = dimensions.reduce((sum, key) => {
                    return sum + (item[key] || 0);
                }, 0)
            }
        });
    }


    if (!shouldSplitByTenure.value) {


        return {
            dimensions: ["timestamp", "total", (shouldDisplayYearlyAverages.value ? "yearly_average" : null)].filter(Boolean),
            source: baseData.value.map(item => {

                let dims = {
                    timestamp: preferredGranularity.value === 'month' ? `${item.year}-${String(item.month).padStart(2, '0')}` : `${language.value === 'fr' ? 'T' : 'Q'}${item.quarter} ${item.year}`,
                    total: Math.round(dimensions.reduce((sum, dim) => sum + item[dim], 0)),
                }


                if (shouldDisplayYearlyAverages.value) {
                    dims.yearly_average = Math.round(preferredGranularity.value === 'month' ? arrayMapForTotalFtesInYear[item.year + (item.month >= 4 ? 1 : 0)] : arrayMapForTotalFtesInYear[item.year + (item.quarter >= 2 ? 1 : 0)]);
                }

                return dims;
            })
        };

    }

    return {
        dimensions: ['timestamp', ...dimensions, (shouldDisplayYearlyAverages.value ? "yearly_average" : null)].filter(Boolean),
        source: baseData.value.map(item => {

            let dims = {
                timestamp: preferredGranularity.value === 'month' ? `${item.year}-${String(item.month).padStart(2, '0')}` : `${language.value === 'fr' ? 'T' : 'Q'}${item.quarter} ${item.year}`,
                indeterminate: Math.round(item.indeterminate),
                term: Math.round(item.term),
                casual: Math.round(item.casual),
                student: Math.round(item.student),
                combined: Math.round(item.combined),
            }

            if (shouldDisplayYearlyAverages.value) {
                dims.yearly_average = Math.round(preferredGranularity.value === 'month' ? arrayMapForTotalFtesInYear[item.year + (item.month >= 4 ? 1 : 0)] : arrayMapForTotalFtesInYear[item.year + (item.quarter >= 2 ? 1 : 0)]);
            }

            return dims;
        })
    };
});

const series = computed(() => {

    const baseSerie = {
        type: 'line',
        stack: 'Total',
        areaStyle: {},
        smooth: true,
        lineStyle: {
            width: 0
        },
        showSymbol: false
    };

    const yearlyAveragesSerie = {
        name: strings.value.yearly_average_label,
        type: 'line',
        step: 'middle',
        showSymbol: false,
        markArea: {
            silent: true,
            data:
                Object.values(dataset.value.source.reduce((accumulator, currentValue) => {

                    let year = parseInt(currentValue.timestamp.match(/(\d{4})/)[1]);

                    if (!year || accumulator[year]) return accumulator;

                    const nextYear = year + 1
                    accumulator[year] = [
                        {

                            name: `${year}-${language.value === 'fr' ? nextYear : String(nextYear).substring(2)}`,
                            xAxis: preferredGranularity.value === 'month' ? `${year}-04` : `${language.value === 'fr' ? 'T' : 'Q'}2 ${year}`,
                            itemStyle: {
                                color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{
                                    offset: 0,
                                    color: useDarkTheme.value ? 'rgba(0, 0, 0, 0)' : 'rgba(255,255,255,0)',
                                },
                                {
                                    offset: 0.5,
                                    color: useDarkTheme.value ? 'rgba(255, 255, 255, 0.1)' : 'oklch(55.4% 0.046 257.417 / 15%)',
                                },

                                {
                                    offset: 1,
                                    color: useDarkTheme.value ? 'rgba(0, 0, 0, 0)' : 'rgba(255,255,255,0)',
                                },
                                ]),
                            },
                        },
                        {
                            xAxis: preferredGranularity.value === 'month' ? `${nextYear}-03` : `${language.value === 'fr' ? 'T' : 'Q'}1 ${nextYear}`,
                        }
                    ];
                    return accumulator;

                }, {})),


        }
    };


    if (!shouldSplitByTenure.value) {
        return [
            {
                ...baseSerie,
                name: strings.value.total_label,
            },
            shouldDisplayYearlyAverages.value ? yearlyAveragesSerie : null,
        ].filter(Boolean);
    }


    let series = [{
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
    shouldIncludeCombinedData.value ? {
        ...baseSerie,
        name: strings.value.combined_label,
    } : null,
    shouldDisplayYearlyAverages.value ? yearlyAveragesSerie : null,
    ].filter(Boolean);


    return series;
})

const chartOptions = computed(() => {

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
        series: series.value,
    };



    options['legend'] = {
        data: options.series.map(serie => serie.name).filter(name => name !== strings.value.yearly_average_label),
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
        useDarkTheme.value = true;
    } else {
        //theme = 'light';
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


watch([preferredGranularity, preferredTimeframe], () => {
    redrawChart();
});

watch([shouldIncludeCombinedData, shouldSplitByTenure, shouldDisplayYearlyAverages], () => {
    // For some reason, echart can't redraw properly after a dataset change
    // see https://github.com/apache/echarts/issues/6202
    chart.value.setOption(chartOptions.value, {
        replaceMerge: ['series'],
    })
});




</script>
