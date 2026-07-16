<template>
    <div
        ref="componentRoot"
        class="flex w-full flex-col gap-8">
        <div
            class="flex flex-wrap items-center justify-between gap-y-4 rounded-sm bg-gray-100 p-4 dark:bg-gray-900">
            <GeneralChartSettings />
            <PreferredTenurePicker />
        </div>
        <div
            v-show="departments.length"
            :id="uniqueId"
            class="h-[300px] md:h-[400px]"></div>
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

    import useLocalizationsStore from "@/stores/localizations.js";
    import useSettingsStore from "@/stores/settings.js";
    import usePayloadsStore from "@/stores/payloads.js";
    import numberFormatterMixin from "@/mixins/numberFormatter.js";

    import {
        GeneralChartSettings,
        PreferredTenurePicker,
    } from "@/components/Shared";

    import * as echarts from "echarts/core";
    import { LineChart } from "echarts/charts";
    import { LabelLayout, UniversalTransition } from "echarts/features";
    import { SVGRenderer } from "echarts/renderers";
    import { registerEchartsThemes } from "@/assets/echarts/themes.js";
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
    const { language } = storeToRefs(localizationsStore);

    const {
        preferredTimeframe,
        preferredGranularity,
        preferredMetric,
        preferredTenure,
    } = storeToRefs(useSettingsStore());

    const payloadsStore = usePayloadsStore();

    const numberFormatter = numberFormatterMixin.methods.numberFormatter;

    const uniqueId = `chart-${Math.random().toString(36).slice(2, 11)}`;
    const componentRoot = useTemplateRef("componentRoot");
    const resObserver = shallowRef(null);
    let chart = shallowRef(null);
    const useDarkTheme = ref(false);

    registerEchartsThemes(echarts);

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

    const dataset = computed(() => {
        if (props.departments.filter((dept) => !dept.eagerLoaded).length)
            return { source: [] };

        let dimensions = ["timestamp"];
        props.departments.forEach((dept) =>
            dimensions.push(dept[`name_${language.value}`]),
        );

        let timestamps = [];
        let deptPoints = {};
        let firstDept = props.departments[0];

        if (!firstDept?.eagerLoaded) return { source: [] };

        const isQuarterly = preferredGranularity.value === "quarter";
        const dataKey = isQuarterly
            ? perQuarterKey.value
            : perFiscalYearKey.value;

        firstDept[dataKey].forEach((item) => {
            const ts = isQuarterly
                ? `${language.value === "fr" ? "T" : "Q"}${item.quarter} ${item.year}`
                : `${item.year - 1}-${item.year}`;
            timestamps.push(ts);
        });

        props.departments.forEach((dept) => {
            const dptName = dept[`name_${language.value}`];
            deptPoints[dptName] = {};

            dept[dataKey].forEach((item) => {
                const ts = isQuarterly
                    ? `${language.value === "fr" ? "T" : "Q"}${item.quarter} ${item.year}`
                    : `${item.year - 1}-${item.year}`;

                const sumOfParts =
                    (item.indeterminate || 0) +
                    (item.term || 0) +
                    (item.casual || 0) +
                    (item.student || 0) +
                    (item.unknown || 0);

                let rawValue;

                if (preferredTenure.value === "combined") {
                    rawValue =
                        sumOfParts === 0 && item.combined
                            ? Math.round(item.combined)
                            : sumOfParts;
                } else {
                    if (sumOfParts === 0 && item.combined > 0) {
                        rawValue = null;
                    } else {
                        rawValue = Math.round(item[preferredTenure.value] || 0);
                    }
                }

                deptPoints[dptName][ts] = rawValue;
            });
        });

        return {
            dimensions,
            source: timestamps.map((ts) => {
                let dataPoint = { timestamp: ts };
                props.departments.forEach((dept) => {
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
                (point) =>
                    point[dptName] !== null && point[dptName] !== undefined,
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
                        width:
                            props.highlightedDepartmentId === dept.id ? 5 : 3,
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
            aria: {
                enabled: true,
            },
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
                        return "N/A";
                    }

                    return formatter(value);
                },
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
        const theme =
            window.matchMedia &&
            window.matchMedia("(prefers-color-scheme: dark)").matches
                ? "dark"
                : "light";

        if (theme === "dark") {
            useDarkTheme.value = true;
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
        () => {
            redrawChart();
            syncDepartments();
        },
    );

    watch(
        () => props.highlightedDepartmentId,
        () => {
            redrawChart();
        },
    );

    watch(
        [
            preferredGranularity,
            preferredTimeframe,
            preferredMetric,
            preferredTenure,
        ],
        () => {
            redrawChart();
        },
    );
</script>
