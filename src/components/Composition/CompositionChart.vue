<template>
    <div
        ref="componentRoot"
        class="flex w-full flex-col gap-2">
        <div
            :id="uniqueId"
            class="h-[80vh] w-full"></div>

        <div class="flex items-center justify-end gap-4 xl:flex-row">
            <label
                class="flex w-fit items-center gap-2 self-end rounded border-solid bg-gray-100 p-2">
                <div class="pr-2 text-xs leading-none font-medium select-none">
                    {{ strings.include_combined_data_label }}
                </div>
                <SwitchRoot
                    v-model="shouldIncludeCombinedData"
                    class="relative flex h-[20px] w-[32px] rounded-full border border-gray-300 shadow-sm transition-[background] focus-within:border-gray-800 focus-within:shadow-[0_0_0_1px] focus-within:shadow-gray-800 focus-within:outline-none data-[state=checked]:border-gray-700 data-[state=checked]:bg-gray-800 data-[state=unchecked]:bg-gray-300 dark:border-gray-700 dark:data-[state=checked]:bg-gray-700 dark:data-[state=unchecked]:bg-gray-800">
                    <SwitchThumb
                        class="my-auto flex h-3.5 w-3.5 translate-x-0.5 items-center justify-center rounded-full bg-white text-xs shadow-xl transition-transform will-change-transform data-[state=checked]:translate-x-full" />
                </SwitchRoot>
            </label>

            <label
                class="flex w-fit items-center gap-2 self-end rounded border-solid bg-gray-100 p-2">
                <div class="pr-2 text-xs leading-none font-medium select-none">
                    {{ strings.should_split_by_tenure_label }}
                </div>
                <SwitchRoot
                    v-model="shouldSplitByTenure"
                    class="relative flex h-[20px] w-[32px] rounded-full border border-gray-300 shadow-sm transition-[background] focus-within:border-gray-800 focus-within:shadow-[0_0_0_1px] focus-within:shadow-gray-800 focus-within:outline-none data-[state=checked]:border-gray-700 data-[state=checked]:bg-gray-800 data-[state=unchecked]:bg-gray-300 dark:border-gray-700 dark:data-[state=checked]:bg-gray-700 dark:data-[state=unchecked]:bg-gray-800">
                    <SwitchThumb
                        class="my-auto flex h-3.5 w-3.5 translate-x-0.5 items-center justify-center rounded-full bg-white text-xs shadow-xl transition-transform will-change-transform data-[state=checked]:translate-x-full" />
                </SwitchRoot>
            </label>
        </div>
    </div>
</template>

<script setup>
    import { SwitchRoot, SwitchThumb } from "reka-ui";
    import {
        onMounted,
        onBeforeUnmount,
        useTemplateRef,
        shallowRef,
        computed,
        watch,
        ref,
    } from "vue";
    import { storeToRefs } from "pinia";

    import usePayloadsStore from "@/stores/payloads.js";
    const payloadsStore = usePayloadsStore();
    const { composition } = storeToRefs(payloadsStore);

    import useLocalizationsStore from "@/stores/localizations.js";
    const localizationsStore = useLocalizationsStore();
    const { language, strings } = storeToRefs(localizationsStore);

    import useSettingsStore from "@/stores/settings.js";
    const settingsStore = useSettingsStore();
    const { preferredTimeframe, preferredGranularity, preferredMetric } =
        storeToRefs(settingsStore);

    const uniqueId = `chart-${Math.random().toString(36).slice(2, 11)}`;
    const componentRoot = useTemplateRef("componentRoot");
    const resObserver = shallowRef(null);

    const shouldIncludeCombinedData = ref(false);
    const shouldSplitByTenure = ref(true);
    const useDarkTheme = ref(false);

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

    registerEchartsThemes(echarts);

    const baseData = computed(() => {
        if (preferredGranularity.value === "quarter") {
            return preferredMetric.value === "pop"
                ? composition.value.total_pops_per_quarter
                : composition.value.total_ftes_per_quarter;
        } else if (preferredGranularity.value === "fiscal_year") {
            return preferredMetric.value === "pop"
                ? composition.value.total_pops_per_fiscal_year
                : composition.value.total_ftes_per_fiscal_year;
        }
        return [];
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

    const dataset = computed(() => {
        let dimensions = [
            "indeterminate",
            "term",
            "casual",
            "student",
            shouldIncludeCombinedData.value ? "combined" : null,
        ].filter(Boolean);

        if (!shouldSplitByTenure.value) {
            return {
                dimensions: ["timestamp", "total"].filter(Boolean),
                source: baseData.value.map((item) => {
                    let dims = {
                        timestamp:
                            preferredGranularity.value === "month"
                                ? `${item.year}-${String(item.month).padStart(2, "0")}`
                                : `${language.value === "fr" ? "T" : "Q"}${item.quarter} ${item.year}`,
                        total: Math.round(
                            dimensions.reduce((sum, dim) => sum + item[dim], 0),
                        ),
                    };

                    return dims;
                }),
            };
        }

        return {
            dimensions: ["timestamp", ...dimensions].filter(Boolean),
            source: baseData.value.map((item) => {
                let dims = {
                    timestamp:
                        preferredGranularity.value === "fiscal_year"
                            ? `${item.year}-${item.year + 1}`
                            : `${language.value === "fr" ? "T" : "Q"}${item.quarter} ${item.year}`,
                    indeterminate: Math.round(item.indeterminate),
                    term: Math.round(item.term),
                    casual: Math.round(item.casual),
                    student: Math.round(item.student),
                    combined: Math.round(item.combined),
                };

                return dims;
            }),
        };
    });

    const series = computed(() => {
        const baseSerie = {
            type: "line",
            stack: "Total",
            areaStyle: {},
            smooth: true,
            lineStyle: {
                width: 0,
            },
            showSymbol: false,
        };

        if (!shouldSplitByTenure.value) {
            return [
                {
                    ...baseSerie,
                    name: strings.value.total_label,
                },
            ].filter(Boolean);
        }

        let series = [
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
            shouldIncludeCombinedData.value
                ? {
                      ...baseSerie,
                      name: strings.value.combined_label,
                  }
                : null,
        ].filter(Boolean);

        return series;
    });

    const formatTooltipNumber = (value) => {
        if (
            value === null ||
            value === undefined ||
            Number.isNaN(Number(value))
        ) {
            return "N/A";
        }

        return localizationsStore.localizeNumber(Number(value));
    };

    const getTooltipNumericValue = (param) => {
        if (typeof param?.value === "number") {
            return param.value;
        }

        if (Array.isArray(param?.value)) {
            const yIndex = Array.isArray(param?.encode?.y)
                ? param.encode.y[0]
                : param.value.length - 1;
            const candidate = param.value?.[yIndex];
            const numericCandidate = Number(candidate);

            return Number.isNaN(numericCandidate) ? 0 : numericCandidate;
        }

        if (param?.data && typeof param.data === "object") {
            const yIndex = Array.isArray(param?.encode?.y)
                ? param.encode.y[0]
                : null;
            const yDimensionName =
                yIndex !== null && Array.isArray(param?.dimensionNames)
                    ? param.dimensionNames[yIndex]
                    : null;

            if (yDimensionName && yDimensionName in param.data) {
                const numericCandidate = Number(param.data[yDimensionName]);

                return Number.isNaN(numericCandidate) ? 0 : numericCandidate;
            }
        }

        const numericData = Number(param?.data);

        return Number.isNaN(numericData) ? 0 : numericData;
    };

    const escapeHtml = (text) => {
        return String(text)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#39;");
    };

    const buildTooltipRow = ({
        marker = "",
        label,
        value,
        isBold = true,
        marginTop = 4,
    }) => {
        return `<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:${marginTop}px;line-height:1.35;"><span style="display:inline-flex;align-items:center;min-width:0;">${marker}<span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(label)}</span></span><span style="margin-left:12px;font-weight:${isBold ? 700 : 400};text-align:right;">${escapeHtml(value)}</span></div>`;
    };

    const tooltipFormatter = (rawParams) => {
        const params = Array.isArray(rawParams) ? rawParams : [rawParams];
        const firstParam = params[0];

        if (!firstParam) {
            return "";
        }

        const timestamp = firstParam.axisValueLabel || firstParam.name || "";
        const total = params.reduce((sum, param) => {
            return sum + getTooltipNumericValue(param);
        }, 0);

        const rows = params.map((param) => {
            const marker = param.marker || "";
            const value = formatTooltipNumber(getTooltipNumericValue(param));

            return buildTooltipRow({
                marker,
                label: param.seriesName,
                value,
            });
        });

        const totalRow = buildTooltipRow({
            label: strings.value.total_label,
            value: formatTooltipNumber(total),
            marginTop: 4,
        });

        return `<div><div style="font-weight:400;line-height:1.35;">${escapeHtml(timestamp)}</div>${rows.join("")}<div style="border-top:1px solid rgba(255,255,255,0.2);">${totalRow}</div></div>`;
    };

    const chartOptions = computed(() => {
        const options = {
            aria: {
                enabled: true,
                decal: {
                    show: true,
                },
            },
            grid: {
                top: 0,
                left: 0,
                right: 0,
            },
            dataZoom: [dataZoom.value],
            tooltip: {
                trigger: "axis",
                formatter: tooltipFormatter,
            },
            xAxis: {
                type: "category",
            },
            yAxis: {},
            dataset: dataset.value,
            series: series.value,
        };

        options["legend"] = {
            data: options.series.map((serie) => serie.name),
            itemHeight: 24,
        };

        return options;
    });

    let chart = shallowRef(null);

    onMounted(() => {
        if (composition.value === false) {
            throw new Error(
                "Composition payload is required to render MainChart. Call 'fetchComposition' action in payloads store before attempting to mount this component.",
            );
        }

        const prefersDarkTheme =
            window.matchMedia &&
            window.matchMedia("(prefers-color-scheme: dark)").matches;
        useDarkTheme.value = prefersDarkTheme;

        chart.value = echarts.init(
            componentRoot.value.querySelector(`#${uniqueId}`),
            prefersDarkTheme ? "dark" : "light",
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

    watch([preferredGranularity, preferredTimeframe, preferredMetric], () => {
        redrawChart();
    });

    watch([shouldIncludeCombinedData, shouldSplitByTenure], () => {
        // For some reason, echart can't redraw properly after a dataset change
        // see https://github.com/apache/echarts/issues/6202
        chart.value.setOption(chartOptions.value, {
            replaceMerge: ["series"],
        });
    });
</script>
