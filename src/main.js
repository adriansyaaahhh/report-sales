import { createApp } from 'vue';
import App from './App.vue';
import './style.css';
import { createRouter, createWebHistory } from 'vue-router';

import FormSales from './components/SalesForm.vue';
import Report from './components/LiveReport.vue';

const routes = [
  { path: '/', redirect: '/form' },
  { path: '/form', component: FormSales },
  { path: '/report', component: Report }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

createApp(App).use(router).mount('#app');
