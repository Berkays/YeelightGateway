<template lang="pug">
    #app
        Navbar()
        GithubCat()
        Devices()
        Footer()
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

import Devices from './components/Devices.vue';
import Footer from './components/Footer.vue';
import GithubCat from './components/Github/Cat.vue';
import Navbar from './components/Navbar.vue';

export default Vue.extend({
	name: 'App',
	components: {
		Navbar, GithubCat, Devices, Footer,
	},
});
</script>
