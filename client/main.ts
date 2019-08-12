// tslint:disable: ordered-imports
import Vue from 'vue';
import App from './App.vue';

import 'jquery';
import 'popper.js';
import 'bootstrap';

import './assets/styles/style.scss';

new Vue({
    render: (h) => h(App),
}).$mount('#app');
