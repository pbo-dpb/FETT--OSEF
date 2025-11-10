import { defineStore } from 'pinia'
import settings from '../assets/settings.json'
import { colors } from '../assets/colors.json?json'

export default defineStore('settings', {
    state: () => ({
        preferredTimeframe: "3Y",
        preferredGranularity: "quarter",
        colors: colors,
        ...settings,

    }),

})