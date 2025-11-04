import { createWebHashHistory, createRouter } from 'vue-router'

import PublicServiceOverview from './components/PublicServiceOverview.vue'
import DepartmentsOverview from './components/DepartmentsOverview.vue'


const routes = [
    { path: '/', component: PublicServiceOverview, name: 'overview' },
    { path: '/departments-and-agencies--ministeres-et-organismes/:departments*', component: DepartmentsOverview, name: 'departments' },
]

export const router = createRouter({
    history: createWebHashHistory(),
    routes,
})