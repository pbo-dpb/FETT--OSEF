import { defineStore } from 'pinia'
import settings from '../assets/settings.json'

export default defineStore('settings', {
    state: () => ({
        ...settings
    }),

})