import { defineStore } from 'pinia'
import aggregationPayloadUrl from '../assets/aggregations.json?url'
import departmentsPayloadUrl from '../assets/departments.json?url'

export default defineStore('payloads', {
    state: () => ({
        departments: false,
        aggregations: false,
        loading: []
    }),
    actions: {

        async fetchAggregations() {
            if (this.loading.includes('aggregations')) return
            this.loading.push('aggregations')

            const response = await fetch(aggregationPayloadUrl)
            const data = await response.json()

            // Temporarely do both assigments in the same round
            this.aggregations = data;

            this.loading = this.loading.filter(item => item !== 'aggregations')

        },

        async fetchDepartments() {
            if (this.loading.includes('departments')) return
            this.loading.push('departments')

            const response = await fetch(departmentsPayloadUrl)
            const data = await response.json()

            this.departments = data;

            this.loading = this.loading.filter(item => item !== 'departments')

        }
    }
})
