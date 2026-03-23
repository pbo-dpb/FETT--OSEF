import { defineStore } from "pinia";
import en from "../assets/strings/en.json";
import fr from "../assets/strings/fr.json";

export default defineStore("localizations", {
    state: () => ({
        language: document.documentElement.lang,
        iStrings: { en, fr },
    }),
    actions: {
        localizeNumber(number, options = { isPercent: false }) {
            const config = {
                minimumFractionDigits: options.isPercent ? 1 : 0,
                maximumFractionDigits: options.isPercent ? 1 : 0,
            };

            const valueToFormat = options.isPercent
                ? number
                : Math.round(number);

            return new Intl.NumberFormat(this.language, config).format(
                valueToFormat,
            );
        },
    },
    getters: {
        strings(state) {
            return state.iStrings[state.language];
        },
    },
});
