import useLocalizationsStore from "../stores/localizations.js";

export default {
    methods: {
        numberFormatter(number, isPercent = false) {
            const localizationStore = useLocalizationsStore();

            return localizationStore.localizeNumber(number, { isPercent });
        },
    },
};
