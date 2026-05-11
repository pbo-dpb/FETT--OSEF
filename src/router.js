import { createWebHashHistory, createRouter } from "vue-router";

const OverviewPage = () => import("./components/Overview/OverviewPage.vue");
const CompositionPage = () =>
    import("./components/Composition/CompositionPage.vue");
const ComparisonPage = () =>
    import("./components/Comparison/ComparisonPage.vue");
const NotesPage = () => import("./components/Notes/NotesPage.vue");

const routes = [
    { path: "/", component: OverviewPage, name: "overview" },
    { path: "/composition", component: CompositionPage, name: "composition" },
    {
        path: "/departments-and-agencies--ministeres-et-organismes/:departments*",
        component: ComparisonPage,
        name: "departments",
    },
    { path: "/notes", component: NotesPage, name: "notes" },
];

export const router = createRouter({
    history: createWebHashHistory(),
    routes,
});
