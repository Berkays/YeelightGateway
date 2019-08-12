<template lang="pug">
    .container
        nav.navbar.navbar-dark.fixed-top.mx-auto.pr-0.shadow-sm.border.border-dark.rounded-bottom(style="background-color: #df2b2f !important;")
            span.navbar-brand.ml-2
                img(src="../assets/images/yeelight.png" style="width:52px; height:52px;")
                span.d-none.d-sm-inline.pl-3.font-encode.font-weight-bold Yeelight Gateway
            .github-container.h-100.border-left.border-gray.d-flex.flex-column.mr-4
                .text-center.align-items-center
                    a.github-button(href="https://github.com/Berkays" data-size="large" data-show-count="true" aria-label="Follow @Berkays on GitHub") Follow @Berkays
                .text-center.align-items-center.justify-content-between.w-100
                    span.mr-2
                        a.github-button(href="https://github.com/Berkays/YeelightGateway" data-icon="octicon-star" data-size="large" data-show-count="true" aria-label="Star Berkays/YeelightGateway on GitHub") Star
                    span
                        a.github-button(href="https://github.com/Berkays/YeelightGateway/fork" data-icon="octicon-repo-forked" data-size="large" data-show-count="true" aria-label="Fork Berkays/YeelightGateway on GitHub") Fork
</template>

<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
	name: 'Navbar',
});
</script>

<style lang="scss" scoped>
$height: 80px;
.navbar {
	max-width: 1000px;
    height: $height;
	z-index: 9;
}

.github-container {
    min-width: 250px;
}

.widget {
    margin-right: 4em;
}

</style>
