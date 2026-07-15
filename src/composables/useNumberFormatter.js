import useLocalizationsStore from "../stores/localizations.js";

export function useNumberFormatter(number, isPercent = false) {
    const localizationStore = useLocalizationsStore();

    return localizationStore.localizeNumber(number, { isPercent });
}
