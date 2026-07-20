<template>
    <div
        ref="componentRoot"
        class="flex flex-col gap-8 rounded-sm border border-transparent dark:border-gray-700">
        <div
            class="flex flex-col justify-between gap-y-4 rounded-sm bg-gray-100 p-4 lg:flex-row dark:bg-gray-900">
            <GeneralChartSettings />
            <div class="flex flex-col gap-4">
                <div class="flex flex-col gap-2">
                    <label class="flex w-fit cursor-pointer gap-2 md:mt-1">
                        <SwitchRoot
                            v-model="shouldSplitByTenure"
                            class="switch-primary focus-outline-primary relative flex h-[20px] w-[32px] cursor-pointer rounded-full border border-1 border-solid border-gray-100 shadow-sm transition-[background] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid data-[state=unchecked]:bg-gray-300 dark:data-[state=checked]:bg-gray-100 dark:data-[state=unchecked]:bg-gray-950">
                            <SwitchThumb
                                class="my-auto flex h-3.5 w-3.5 translate-x-0.5 items-center justify-center rounded-full bg-white text-xs shadow-xl transition-transform will-change-transform data-[state=checked]:translate-x-full dark:bg-gray-950 dark:data-[state=unchecked]:bg-gray-100" />
                        </SwitchRoot>
                        <div class="leading-none font-semibold">
                            {{ strings.should_split_by_tenure_label }}
                        </div>
                    </label>
                    <fieldset
                        v-if="shouldSplitByTenure"
                        class="grid grid-cols-1 ps-1 md:grid-cols-2">
                        <legend class="sr-only">
                            {{ strings.composition_selected_tenures }}
                        </legend>
                        <label
                            v-for="tenure in tenuresToBeDisplayed"
                            :key="tenure"
                            class="cols-span-1 cursor-pointer items-center gap-2">
                            <input
                                type="checkbox"
                                :value="tenure"
                                v-model="selectedTenures"
                                class="accent-[#2a5673]"
                                :disabled="
                                    selectedTenures.length === 1 &&
                                    selectedTenures.includes(tenure)
                                " />
                            {{ tenureStringMap[tenure] }}
                        </label>
                    </fieldset>
                </div>
                <label class="flex w-fit cursor-pointer gap-2 md:mt-1">
                    <SwitchRoot
                        v-model="shouldIncludeCombinedData"
                        class="switch-primary focus-outline-primary relative flex h-[20px] w-[32px] cursor-pointer rounded-full border border-1 border-solid border-gray-100 shadow-sm transition-[background] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid data-[state=unchecked]:bg-gray-300 dark:data-[state=checked]:bg-gray-100 dark:data-[state=unchecked]:bg-gray-950">
                        <SwitchThumb
                            class="my-auto flex h-3.5 w-3.5 translate-x-0.5 items-center justify-center rounded-full bg-white text-xs shadow-xl transition-transform will-change-transform data-[state=checked]:translate-x-full dark:bg-gray-950 dark:data-[state=unchecked]:bg-gray-100" />
                    </SwitchRoot>
                    <div class="leading-none font-semibold">
                        {{ strings.include_combined_data_label }}
                    </div>
                </label>
            </div>
        </div>
        <div
            :id="uniqueId"
            class="h-[300px] md:h-[400px]"></div>
    </div>
</template>

<script setup>
    import {
        ref,
        shallowRef,
        computed,
        watch,
        onMounted,
        onBeforeUnmount,
        useTemplateRef,
    } from "vue";
    import { storeToRefs } from "pinia";
    import { SwitchRoot, SwitchThumb } from "reka-ui";

    import * as echarts from "echarts/core";
    import { LineChart } from "echarts/charts";
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
    import { LabelLayout, UniversalTransition } from "echarts/features";
    import { SVGRenderer } from "echarts/renderers";

    import colors from "@/assets/echarts/colors.json";
    import { registerEchartsThemes } from "@/assets/echarts/themes.js";

    import usePayloadsStore from "@/stores/payloads.js";
    import useLocalizationsStore from "@/stores/localizations.js";
    import useSettingsStore from "@/stores/settings.js";

    import { GeneralChartSettings } from "@/components/Shared";

    const payloadsStore = usePayloadsStore();
    const localizationsStore = useLocalizationsStore();
    const settingsStore = useSettingsStore();

    const { composition } = storeToRefs(payloadsStore);
    const { language, strings } = storeToRefs(localizationsStore);
    const { preferredTimeframe, preferredGranularity, preferredMetric } =
        storeToRefs(settingsStore);

    const uniqueId = `chart-${Math.random().toString(36).slice(2, 11)}`;
    const allTenures = [
        "indeterminate",
        "term",
        "casual",
        "student",
        "unknown",
    ];
    const tenuresToBeDisplayed = allTenures.filter(
        (tenure) => tenure !== "unknown",
    );

    const componentRoot = useTemplateRef("componentRoot");
    const chart = shallowRef(null);

    const shouldIncludeCombinedData = ref(true);
    const shouldSplitByTenure = ref(true);
    const useDarkTheme = ref(false);

    const selectedTenures = ref([...allTenures]);

    const activeTenures = computed(() =>
        shouldSplitByTenure.value ? selectedTenures.value : allTenures,
    );

    // Colors
    const palette = computed(() =>
        useDarkTheme.value ? colors.colors.dark : colors.colors.light,
    );

    const tenureColorMap = computed(() => {
        const map = {};

        allTenures.forEach((tenure, index) => {
            map[tenure] = palette.value[index];
        });

        map.combined = palette.value[allTenures.length];

        return map;
    });

    // Granularity
    const baseData = computed(() => {
        if (preferredGranularity.value === "quarter") {
            return preferredMetric.value === "pop"
                ? composition.value.total_pops_per_quarter
                : composition.value.total_ftes_per_quarter;
        }

        if (preferredGranularity.value === "fiscal_year") {
            return preferredMetric.value === "pop"
                ? composition.value.total_pops_per_fiscal_year
                : composition.value.total_ftes_per_fiscal_year;
        }

        return [];
    });

    const tenureStringMap = computed(() => ({
        indeterminate: strings.value.indeterminate_label,
        term: strings.value.term_label,
        casual: strings.value.casual_label,
        student: strings.value.student_label,
    }));

    const dataZoom = computed(() => {
        let start = 0;
        let end = 100;

        const numberOfXAxisPoints = dataset.value.source.length;
        const oneYearGranularity =
            preferredGranularity.value === "fiscal_year" ? 1 : 4;

        if (preferredTimeframe.value === "1Y") {
            start = 100 - (oneYearGranularity / numberOfXAxisPoints) * 100;
        } else if (preferredTimeframe.value === "3Y") {
            start =
                100 - ((3 * oneYearGranularity) / numberOfXAxisPoints) * 100;
        } else if (preferredTimeframe.value === "5Y") {
            start =
                100 - ((5 * oneYearGranularity) / numberOfXAxisPoints) * 100;
        } else if (preferredTimeframe.value === "10Y") {
            start =
                100 - ((10 * oneYearGranularity) / numberOfXAxisPoints) * 100;
        }

        return { type: "inside", start, end };
    });

    // Dataset & Series
    const dataset = computed(() => {
        const dimensions = [
            ...activeTenures.value,
            shouldIncludeCombinedData.value ? "combined" : null,
        ].filter(Boolean);

        if (!shouldSplitByTenure.value) {
            return {
                dimensions: ["timestamp", "value"],
                source: baseData.value.map((item) => ({
                    timestamp:
                        preferredGranularity.value === "fiscal_year"
                            ? `${item.year - 1}-${item.year}`
                            : `${language.value === "fr" ? "T" : "Q"}${item.quarter} ${item.year}`,
                    value: shouldIncludeCombinedData.value
                        ? Math.round(item.combined)
                        : Math.round(
                              allTenures.reduce(
                                  (sum, t) => sum + Number(item[t] || 0),
                                  0,
                              ),
                          ),
                })),
            };
        }

        return {
            dimensions: ["timestamp", ...dimensions],
            source: baseData.value.map((item) => ({
                timestamp:
                    preferredGranularity.value === "fiscal_year"
                        ? `${item.year - 1}-${item.year}`
                        : `${language.value === "fr" ? "T" : "Q"}${item.quarter} ${item.year}`,
                indeterminate: Math.round(item.indeterminate),
                term: Math.round(item.term),
                casual: Math.round(item.casual),
                student: Math.round(item.student),
                unknown: Math.round(item.unknown),
                combined: Math.round(item.combined),
            })),
        };
    });

    const series = computed(() => {
        const baseSerie = {
            type: "line",
            stack: "Total",
            areaStyle: { opacity: 1 },
            smooth: true,
            lineStyle: { width: 0 },
            showSymbol: false,
        };

        if (!shouldSplitByTenure.value) {
            return [
                {
                    ...baseSerie,
                    name: strings.value.total_label,
                    encode: { x: "timestamp", y: "value" },
                },
            ];
        }

        const result = tenuresToBeDisplayed
            .filter((tenure) => activeTenures.value.includes(tenure))
            .map((tenure) => ({
                ...baseSerie,
                name: tenureStringMap.value[tenure],
                encode: { x: "timestamp", y: tenure },
                itemStyle: { color: tenureColorMap.value[tenure] },
            }));

        if (shouldIncludeCombinedData.value) {
            result.push({
                ...baseSerie,
                name: strings.value.combined_label,
                encode: { x: "timestamp", y: "combined" },
                itemStyle: { color: tenureColorMap.value.combined },
            });
        }

        return result;
    });

    // Tooltip
    const escapeHtml = (text) =>
        String(text)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#39;");

    const formatTooltipNumber = (value) => {
        if (value == null || Number.isNaN(Number(value))) return "N/A";
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
            const num = Number(candidate);

            return Number.isNaN(num) ? 0 : num;
        }

        if (param?.data && typeof param.data === "object") {
            const yIndex = Array.isArray(param?.encode?.y)
                ? param.encode.y[0]
                : null;

            const dimensionName =
                yIndex !== null && Array.isArray(param?.dimensionNames)
                    ? param.dimensionNames[yIndex]
                    : null;

            if (dimensionName && dimensionName in param.data) {
                const num = Number(param.data[dimensionName]);
                return Number.isNaN(num) ? 0 : num;
            }
        }

        const num = Number(param?.data);
        return Number.isNaN(num) ? 0 : num;
    };

    const buildTooltipRow = ({
        marker = "",
        label,
        value,
        isBold = true,
        marginTop = 4,
    }) => {
        return `<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:${marginTop}px;line-height:1.35;">
        <span style="display:inline-flex;align-items:center;min-width:0;">
            ${marker}
            <span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                ${escapeHtml(label)}
            </span>
        </span>
        <span style="margin-left:12px;font-weight:${isBold ? 700 : 400};text-align:right;">
            ${escapeHtml(value)}
        </span>
    </div>`;
    };

    const tooltipFormatter = (rawParams) => {
        const params = Array.isArray(rawParams) ? rawParams : [rawParams];
        const firstParam = params[0];

        if (!firstParam) return "";

        const timestamp = firstParam.axisValueLabel || firstParam.name || "";

        const getTotalForTooltip = (param) => {
            const data = param?.data;

            if (!data || typeof data !== "object") return 0;

            const tenureTotal =
                Number(data.indeterminate || 0) +
                Number(data.term || 0) +
                Number(data.casual || 0) +
                Number(data.student || 0) +
                Number(data.unknown || 0);

            if (shouldIncludeCombinedData.value) {
                return tenureTotal + data.combined || 0;
            }

            return tenureTotal;
        };

        const total = getTotalForTooltip(firstParam);

        const rows = params.map((param) => {
            return buildTooltipRow({
                marker: param.marker || "",
                label: param.seriesName,
                value: formatTooltipNumber(getTooltipNumericValue(param)),
            });
        });

        const totalRow = buildTooltipRow({
            label: strings.value.total_label,
            value: formatTooltipNumber(total),
            marginTop: 4,
        });

        return `<div>
        <div style="font-weight:400;line-height:1.35;">
            ${escapeHtml(timestamp)}
        </div>
        ${rows.join("")}
        <div style="border-top:1px solid rgba(255,255,255,0.2);">
            ${totalRow}
        </div>
    </div>`;
    };

    // ECharts
    const chartOptions = computed(() => ({
        aria: { enabled: true },
        grid: {
            top: 0,
            left: 0,
            right: 0,
            bottom: 8 + 32 + 36,
        },
        dataZoom: [dataZoom.value],
        tooltip: {
            trigger: "axis",
            formatter: tooltipFormatter,
        },
        legend: {
            orient: "horizontal",
            type: "scroll",
            icon: "circle",
            itemHeight: 20,
            itemGap: 20,
            left: "center",
            bottom: 8,
            selectedMode: false,
        },
        xAxis: { type: "category" },
        yAxis: {},
        dataset: dataset.value,
        series: series.value,
    }));

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

    // Lifecycle
    onMounted(() => {
        if (composition.value === false) {
            throw new Error("Composition payload is required");
        }

        useDarkTheme.value =
            window.matchMedia &&
            window.matchMedia("(prefers-color-scheme: dark)").matches;

        chart.value = echarts.init(
            componentRoot.value.querySelector(`#${uniqueId}`),
            useDarkTheme.value ? "dark" : "light",
            { renderer: "svg", locale: language.value },
        );

        chart.value.setOption(chartOptions.value);

        new ResizeObserver(() => chart.value?.resize()).observe(
            componentRoot.value.querySelector(`#${uniqueId}`),
        );
    });

    onBeforeUnmount(() => chart.value?.dispose());

    // Watchers
    watch([preferredGranularity, preferredTimeframe, preferredMetric], () =>
        chart.value.setOption(chartOptions.value),
    );

    watch(shouldSplitByTenure, (v) => {
        if (!v) selectedTenures.value = [...allTenures];
    });

    watch(
        [
            selectedTenures,
            shouldIncludeCombinedData,
            shouldSplitByTenure,
            language,
        ],
        () => {
            chart.value.setOption(chartOptions.value, {
                replaceMerge: ["series"],
            });
        },
    );
</script>
