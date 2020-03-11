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
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ "../views/Editor.vue")
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

export default router;
