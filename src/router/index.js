import Vue from "vue";
import VueRouter from "vue-router";
import GeneratorView from "../views/Generator.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Generator",
    component: GeneratorView
  },
  {
    path: "/editor",
    name: "Editor",
    component: () => import(/* webpackChunkName: "editor" */ "../views/Editor.vue")
  },
  {
    path: "/editor/:id",
    name: "EditorGame",
    component: () => import(/* webpackChunkName: "editor_game" */ "../views/Editor_Game.vue")
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

export default router;
