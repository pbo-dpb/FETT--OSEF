import useLocalizationsStore from "../stores/localizations.js";

export default {
    methods: {
        numberFormatter(number) {
            const localizationStore = useLocalizationsStore();

            return localizationStore.localizeNumber(number);
        },
    },
};
