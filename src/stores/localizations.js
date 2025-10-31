import { defineStore } from 'pinia'
import en from '../assets/strings/en.json'
import fr from '../assets/strings/fr.json'

export default defineStore('localizations', {
    state: () => ({
        language: document.documentElement.lang,
        iStrings: { en, fr }
    }),

    getters: {
        strings(state) {
            return state.iStrings[state.language];
        },
    },
})