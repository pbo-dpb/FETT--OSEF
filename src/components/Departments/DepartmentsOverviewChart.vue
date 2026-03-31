<template>
    <div
        ref="componentRoot"
        class="flex w-full flex-col gap-8"
        :class="{
            blur: !departments.length,
        }">
        <div class="flex items-center justify-between">
            <GeneralChartSettings />
            <select
                class="rounded-sm border border-solid border-gray-300"
                v-model="preferredBreakdown">
                <option value="indeterminate">{{ strings.dep_indeterminate }}</option>
                <option value="term">{{ strings.dep_term }}</option>
                <option value="casual">{{ strings.dep_casual }}</option>
                <option value="student">{{ strings.dep_student }}</option>
                <option value="combined">{{ strings.dep_combined }}</option>
            </select>
        </div>
        <div
            v-show="departments.length"
            :id="uniqueId"
            class="h-[40vh] w-full"></div>
        <img
            v-show="!departments.length"
            :src="departmentsOverviewPlaceholderUrl"
            alt=""
            style="aspect-ratio: 1470/364" />
    </div>
</template>

<script setup>
    import {
        onMounted,
        onBeforeUnmount,
        useTemplateRef,
        shallowRef,
        computed,
        watch,
        ref,
        toRaw,
    } from "vue";
    import { storeToRefs } from "pinia";

    import useLocalizationsStore from "../../stores/localizations.js";
    import useSettingsStore from "../../stores/settings.js";
    import usePayloadsStore from "../../stores/payloads.js";
    import numberFormatterMixin from "../../mixins/numberFormatter.js";
    
    import departmentsOverviewPlaceholderUrl from "../../assets/departments-overview-placeholder.svg?url";
    import GeneralChartSettings from "../GeneralChartSettings.vue";

    import * as echarts from "echarts/core";
    import { LineChart } from "echarts/charts";
    import { LabelLayout, UniversalTransition } from "echarts/features";
    import { SVGRenderer } from "echarts/renderers";
    import { colors } from "../../assets/colors.json?json";
    import lightTheme from "../../assets/echarts/light.json?json";
    import darkTheme from "../../assets/echarts/dark.json?json";
    import {
        TooltipComponent,
        GridComponent,
        DatasetComponent,
        TransformComponent,
        LegendComponent,
        DataZoomComponent,
        MarkAreaComponent,
        AriaComponent,
    } from "echarts/components";

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
        AriaComponent,
    ]);

    const localizationsStore = useLocalizationsStore();
    const { language, strings } = storeToRefs(localizationsStore);

    const settingsStore = useSettingsStore();
    const { preferredTimeframe, preferredGranularity, preferredMetric } =
        storeToRefs(settingsStore);

    const payloadsStore = usePayloadsStore();

    const numberFormatter = numberFormatterMixin.methods.numberFormatter;

    const uniqueId = `chart-${Math.random().toString(36).slice(2, 11)}`;
    const componentRoot = useTemplateRef("componentRoot");
    const resObserver = shallowRef(null);
    let chart = shallowRef(null);
    const useDarkTheme = ref(false);

    darkTheme["color"] = colors.dark;
    darkTheme["graph"]["color"] = colors.dark;
    echarts.registerTheme("dark", darkTheme);
    lightTheme["color"] = colors.light;
    lightTheme["graph"]["color"] = colors.light;
    echarts.registerTheme("light", lightTheme);

    const props = defineProps({
        departments: {
            type: Array,
            required: true,
        },
        highlightedDepartmentId: {
            type: String,
            required: false,
        },
    });

    const perQuarterKey = computed(() =>
        preferredMetric.value === "pop"
            ? "total_pops_per_quarter"
            : "total_ftes_per_quarter",
    );

    const perFiscalYearKey = computed(() =>
        preferredMetric.value === "pop"
            ? "total_pops_per_fiscal_year"
            : "total_ftes_per_fiscal_year",
    );

    const preferredBreakdown = ref("combined");

    const dataset = computed(() => {
        if (props.departments.filter((dept) => !dept.eagerLoaded).length) return { source: [] };

        let dimensions = ["timestamp"];
        props.departments.forEach(dept => dimensions.push(dept[`name_${language.value}`]));

        let timestamps = [];
        let deptPoints = {};
        let firstDept = props.departments[0];

        if (!firstDept?.eagerLoaded) return { source: [] };

        const isQuarterly = preferredGranularity.value === "quarter";
        const dataKey = isQuarterly ? perQuarterKey.value : perFiscalYearKey.value;

        firstDept[dataKey].forEach((item) => {
            const ts = isQuarterly 
                ? `${language.value === "fr" ? "T" : "Q"}${item.quarter} ${item.year}`
                : `${item.year}-${item.year + 1}`;
            timestamps.push(ts);
        });

        props.departments.forEach((dept) => {
            const dptName = dept[`name_${language.value}`];
            deptPoints[dptName] = {};

           dept[dataKey].forEach((item) => {
                const ts = isQuarterly 
                    ? `${language.value === "fr" ? "T" : "Q"}${item.quarter} ${item.year}`
                    : `${item.year}-${item.year + 1}`;

                const sumOfParts = Math.round(item.indeterminate || 0) + 
                    Math.round(item.term || 0) + 
                    Math.round(item.casual || 0) + 
                    Math.round(item.student || 0);

                let rawValue;

                if (preferredBreakdown.value === "combined") {
                    rawValue = (sumOfParts === 0 && item.combined) ? Math.round(item.combined) : sumOfParts;
                } else {
                    if (sumOfParts === 0 && item.combined > 0) {
                        rawValue = null;
                    } else {
                        rawValue = Math.round(item[preferredBreakdown.value] || 0);
                    }
                }

                deptPoints[dptName][ts] = rawValue;
            });
        });

        return {
            dimensions,
            source: timestamps.map(ts => {
                let dataPoint = { timestamp: ts };
                props.departments.forEach(dept => {
                    const dptName = dept[`name_${language.value}`];
                    const val = deptPoints[dptName][ts];

                    dataPoint[dptName] = val === null ? null : (val ?? 0);
                });
                
                return dataPoint;
            }),
        };
    });

    const series = computed(() => {
        let series = [];

        props.departments.forEach((dept) => {
            if (!dept.eagerLoaded) return;

            const dptName = dept[`name_${language.value}`];
            const hasVisibleData = dataset.value.source.some(
                point => point[dptName] !== null && point[dptName] !== undefined
            );

            if (hasVisibleData) {
                series.push({
                    type: "line",
                    smooth: true,
                    showSymbol: false,
                    name: dept[`name_${language.value}`],
                    itemStyle: {
                        color: dept["color"] || "red",
                    },
                    lineStyle: {
                        width: props.highlightedDepartmentId === dept.id ? 5 : 3,
                        shadowBlur:
                            props.highlightedDepartmentId === dept.id ? 10 : 0,
                        shadowColor: useDarkTheme.value ? "#1e293b" : "#cbd5e1",
                        shadowOffsetY: 0,
                    },
                });
            }
        });

        return series;
    });

    const dataZoom = computed(() => {
        let start = 0;
        let end = 100;

        let numberOfXAxisPoints = dataset.value.source.length;

        const oneYearGranularity =
            preferredGranularity.value === "fiscal_year" ? 1 : 4;

        if (preferredTimeframe.value === "1Y") {
            start = 100 - (oneYearGranularity / numberOfXAxisPoints) * 100;
            end = 100;
        } else if (preferredTimeframe.value === "3Y") {
            start =
                100 - ((3 * oneYearGranularity) / numberOfXAxisPoints) * 100;
            end = 100;
        } else if (preferredTimeframe.value === "5Y") {
            start =
                100 - ((5 * oneYearGranularity) / numberOfXAxisPoints) * 100;
            end = 100;
        } else if (preferredTimeframe.value === "10Y") {
            start =
                100 - ((10 * oneYearGranularity) / numberOfXAxisPoints) * 100;
            end = 100;
        } else if (preferredTimeframe.value === "MAX") {
            start = 0;
            end = 100;
        }
        return {
            type: "inside",
            start,
            end,
        };
    });

    const chartOptions = computed(() => {
        const formatter = numberFormatter;

        const options = {
            grid: {
                top: 0,
                right: 0,
                left: 0,
            },
            dataZoom: [dataZoom.value],
            tooltip: {
                trigger: "axis",
                valueFormatter: (value) => {
                    if (value === null || value === undefined || isNaN(value)) {
                        return "N/A"
                    }

                    return formatter(value);
                }
            },
            xAxis: {
                type: "category",
            },
            yAxis: {},
            series: series.value,
            dataset: dataset.value,
        };

        // options['legend'] = {
        //     data: options.series.map(serie => serie.name),
        // }

        return options;
    });

    const redrawChart = () => {
        chart.value.setOption(chartOptions.value, true);
    };

    const syncDepartments = () => {
        props.departments.forEach((dept) => {
            if (!dept.eagerLoaded) {
                // Fetch eager loaded data for the department
                payloadsStore.eagerLoadDepartment(dept.id).then(() => {
                    redrawChart();
                });
            }
        });
    };

    onMounted(() => {
        let theme = null;

        if (
            window.matchMedia &&
            window.matchMedia("(prefers-color-scheme: dark)").matches
        ) {
            theme = "dark";
            useDarkTheme.value = true;
        } else {
            theme = "light";
        }

        chart.value = echarts.init(
            componentRoot.value.querySelector(`#${uniqueId}`),
            theme,
            {
                renderer: "svg",
                locale: language.value,
            },
        );

        chart.value.setOption(chartOptions.value);

        resObserver.value = new ResizeObserver(() => {
            if (chart.value) {
                chart.value.resize();
            }
        }).observe(componentRoot.value.querySelector(`#${uniqueId}`));

        // Sync departments
        syncDepartments();

        console.log("Selected department(s):", toRaw(props.departments));
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

    watch(
        () => props.departments,
        (newDeptList, oldDeptList) => {
            redrawChart();
            syncDepartments();
        },
    );

    watch(
        () => props.highlightedDepartmentId,
        (newId, oldId) => {
            redrawChart();
        },
    );

    watch(
        [
            preferredGranularity,
            preferredTimeframe,
            preferredMetric,
            preferredBreakdown,
        ],
        () => {
            redrawChart();
        },
    );
</script>
