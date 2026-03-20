import { createWebHashHistory, createRouter } from "vue-router";

const Overview = () => import("./components/Overview/Overview.vue");
const Composition = () => import("./components/Composition/Composition.vue");
const Departments = () => import("./components/Departments/Departments.vue");

const routes = [
    { path: "/", component: Overview, name: "overview" },
    { path: "/composition", component: Composition, name: "composition" },
    {
        path: "/departments-and-agencies--ministeres-et-organismes/:departments*",
        component: Departments,
        name: "departments",
    },
];

export const router = createRouter({
    history: createWebHashHistory(),
    routes,
});
