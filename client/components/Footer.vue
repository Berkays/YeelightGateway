<template lang="pug">
footer
    .container-fluid.h-100.p-3
        .row.h-100.align-items-center.justify-content-center
            .col-12.col-sm-12.col-md-6.text-lg-right.text-center
                span.d-block 
                    | Developed with 
                    i.fa.fa-heart(alt="Love")
                    |  By 
                    a(href="https://github.com/Berkays" target="_blank") Berkay Gürsoy
            hr.col-sm-12.d-sm-block.d-md-none
            .col-12.col-sm-12.col-md-6.border-left.text-lg-left.text-center
                span.d-block
                    | ETH:
                    img.d-inline.mx-2.mb-1(src="../assets/images/ethereum.png" alt="Ethereum")
                    | 0x817b17AB96855B008d30ff1A91dd7D931AC6EFEe
</span>
</template>

<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
	name: 'Footer',
});
</script>

<style lang="scss" scoped>
@import url("https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css");

$footer-height: 7rem;
$footer-color: white;

footer {
	position: absolute;
	bottom: 0;
	width: 100%;
	height: $footer-height;
	background-color: $footer-color;

	a {
		border-bottom: 2px solid #453886;
		padding-bottom: 0.25em;
		color: #453886;
		text-decoration: none;

		&:hover {
			text-decoration: none;
			color: #1f154e;
		}
	}

	img {
		width: 12px;
		height: 22px;
	}
}
.fa-heart {
	color: red;
}
</style>
