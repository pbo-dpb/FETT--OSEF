import { createWebHashHistory, createRouter } from 'vue-router'

const PublicServiceOverview = () => import('./components/PublicServiceOverview/PublicServiceOverview.vue')
const DepartmentsOverview = () => import('./components/DepartmentsOverview/DepartmentsOverview.vue')


const routes = [
    { path: '/', component: PublicServiceOverview, name: 'overview' },
    { path: '/departments-and-agencies--ministeres-et-organismes/:departments*', component: DepartmentsOverview, name: 'departments' },
]

export const router = createRouter({
    history: createWebHashHistory(),
    routes,
})