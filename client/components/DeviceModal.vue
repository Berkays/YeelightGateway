<template lang="pug">
#deviceModal.modal.fade(tabindex="-1" role="dialog")
	.modal-dialog(role="document")
		.modal-content
			.modal-header
				h5.modal-title Light:
				button.close(type="button" data-dismiss="modal" aria-label="Close")
					span(aria-hidden="true") ×
			.modal-body
				p TODO
			.modal-footer
				button.btn.btn-secondary(type="button" data-dismiss="modal") Close
</template>

<script lang="ts">
import $ from 'jquery';
import Vue from 'vue';

import axios from 'axios';

import Component from 'vue-class-component';
import { IDeviceInfo } from '../../common/DeviceInfo';

@Component({})
export default class DeviceModal extends Vue {
	public device: IDeviceInfo;
	protected deviceId: string;
	protected modal: JQuery<HTMLElement>;

	private getDetails() {
		axios
			.get('/api/devices/' + this.deviceId)
			.then(response => {
				this.device = response.data.device;
			})
			.catch(error => {
				console.log(error);
			});
	}

	private mounted() {
		const vm = this;
		const h = $('#deviceModal');
		$('#deviceModal').on('show.bs.modal', function (event) {
			const button = $(event.relatedTarget);
			const deviceId = button.data('device');

			vm.deviceId = deviceId;

			const modal = $(this);
			vm.modal = modal;
			modal.find('.modal-title').text('Light: ' + deviceId);

			vm.getDetails();
		});
	}
}
</script>

