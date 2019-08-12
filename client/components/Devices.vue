<template lang="pug">
    .container.vertical-center
        DeviceModal()
        .row.justify-content-center.w-100
            .col-12.ml-4
                .p-5.bg-white.shadow.rounded
                    h3.text-center.mb-4 Active Devices
                    .text-center(v-show="devices.length <= 0 && isRefreshing == false")
                        .lead No devices found.
                        .btn.btn-info.btn-sm.mt-3(v-on:click="refreshDevices()") Refresh Device List
                    #loader.py-2
                        small(v-show="devices.length > 0") * Click on device index for more settings.
                        vue-element-loading(:active="isRefreshing" spinner="bar-fade-scale")
                        .table-responsive.rounded-lg.shadow-sm.border.border-gray.card(v-show="devices.length > 0")
                            table.table.text-center.mb-0
                                thead
                                    tr
                                        th(scope="col") #
                                        th(scope="col") Name
                                        th.d-none.d-md-table-cell(scope="col") Brightness
                                        th(scope="col") Mode
                                        th.d-none.d-lg-table-cell(scope="col") Color
                                        th.d-none.d-lg-table-cell(scope="col") Temperature
                                        th.d-none.d-lg-table-cell(scope="col") Status
                                        th(scope="col") Toggle
                                tbody
                                    tr(v-for="(device,index) in devices")
                                        th(scope="row")
                                            .btn.btn-info.rounded-circle(data-toggle="modal" data-target="#deviceModal" :data-device="device.id") {{ index + 1 }}
                                        td {{ device.name }}
                                        td.d-none.d-md-table-cell 
                                            VueNumberInput(:step="10" :min="0" :max="100" :value="Number(device.bright)" @change="(newValue,oldValue) => { adjustBrightness(device.id,newValue); }" size="small" :inputtable="false" inline center controls)
                                        td 
                                            ToggleButton(:value="device.color_mode == 'white'" :width="80" :height="35" :margin="2" :css-colors="false" :color="{checked: '#75C791', unchecked: '#ff9200', disabled: '#CCCCCC'}" :labels="{checked: 'White', unchecked: 'Color'}" @change="changeDeviceColorMode(device.id)")
                                        td.d-none.d-lg-table-cell(v-if="device.color_mode == 'color' && device.power")
                                            .container
                                                .row.justify-content-center(v-bind:class="{ 'text-white':getColorContrast(device.rgb) }") {{ getColorString(device.rgb) }})
                                                .row.m-1.rounded-lg(style="min-height:20px" v-bind:style="{ 'background-color': getColorString(device.rgb) }")
                                        td.d-none.d-lg-table-cell(v-else) -
                                        td.d-none.d-lg-table-cell(v-if="device.color_mode == 'white' && device.power")
                                            VueNumberInput(:step="250" :min="1700" :max="6500" :value="Number(device.ct)" @change="(newValue,oldValue) => { adjustTemperature(device.id,newValue); }" size="small" :inputtable="false" inline center controls)
                                        td.d-none.d-lg-table-cell(v-else) -
                                        td.d-none.d-lg-table-cell
                                            .mt-2.rounded-circle.border.border-dark.shadow.mx-auto.bg-success(v-if="device.power" style="height:15px;width:15px" data-toggle="tooltip" title="On")
                                            .mt-2.rounded-circle.border.border-dark.shadow.mx-auto.bg-danger(v-else  style="height:15px;width:15px" data-toggle="tooltip" title="Off")
                                        td
                                            ToggleButton.mt-1(:value="device.power" :width="65" :height="30" :labels="{checked: 'On', unchecked: 'Off'}" @change="toggleDevice(device.id)")
                    .mt-4.text-center.text-danger(v-if="isError == true") {{ errorMessage }}
</template>

<script lang="ts">
import axios from 'axios';
import Vue from 'vue';
import Component from 'vue-class-component';
import { IDeviceInfo } from '../../common/DeviceInfo';
import { deserializeRGB } from '../../common/utils';

import DeviceModal from './DeviceModal.vue';

import VueNumberInput from '@chenfengyuan/vue-number-input';
import VueElementLoading from 'vue-element-loading';
import { ToggleButton } from 'vue-js-toggle-button';

@Component({
	components: {
		DeviceModal,
		ToggleButton,
		VueElementLoading,
		VueNumberInput,
	},
})
export default class DevicesComponent extends Vue {
	public devices: IDeviceInfo[] = [];

	public firstLoad: boolean = true;
	public isRefreshing: boolean = false;
	public isError: boolean = false;
	public errorMessage: string = '';

	private errorTimeoutHandler: NodeJS.Timeout;

	public mounted() {
		this.refreshDevices();
		setTimeout(() => {
			this.firstLoad = false;
		}, 2000);
	}

	public refreshDevices(): void {
		this.isRefreshing = true;
		axios
			.get('/api/devices/refresh')
			.then(response => {
				this.devices = response.data.devices;
				this.isRefreshing = false;
			})
			.catch(error => {
				this.showError(error);
				this.isRefreshing = false;
			});
	}

	public getDeviceDetails(): void {
		this.isRefreshing = true;
		axios
			.get('/api/devices')
			.then(response => {
				this.devices = response.data.devices;
				this.isRefreshing = false;
			})
			.catch(error => {
				this.showError(error);
				this.isRefreshing = false;
			});
	}

	public changeDeviceColorMode(deviceId: string): void {
		axios
			.get('/api/devices/' + deviceId + '/color_mode')
			.then(response => {
				this.getDeviceDetails();
			})
			.catch(error => {
				this.refreshDevices();
				this.showError(error);
			});
	}

	public toggleDevice(deviceId: string): void {
		axios
			.get('/api/devices/' + deviceId + '/toggle')
			.then(response => {
				this.getDeviceDetails();
			})
			.catch(error => {
				this.showError(error);
			});
	}

	public adjustBrightness(deviceId: string, newValue: number): void {
		if (this.firstLoad == true) {
			return;
		}
		axios
			.get('/api/devices/' + deviceId + '/brightness?value=' + newValue)
			.then(response => {
				this.getDeviceDetails();
			})
			.catch(error => {
				this.showError(error);
				this.refreshDevices();
			});
	}

	public adjustTemperature(deviceId: string, newValue: number): void {
		if (this.firstLoad == true) {
			return;
		}
		axios
			.get('/api/devices/' + deviceId + '/temperature?value=' + newValue)
			.then(response => {
				this.getDeviceDetails();
			})
			.catch(error => {
				this.showError(error);
				this.refreshDevices();
			});
	}

	public getColorContrast(value: number): boolean {
		const colors = deserializeRGB(value);
		const luminance =
			(0.299 * colors[0] + 0.587 * colors[1] + 0.114 * colors[2]) / 255;
		if (luminance > 0.5) {
			return true;
		} else {
			return false;
		}
	}

	public getColorString(value: number): string {
		const colors = deserializeRGB(value);
		return `rgb(${colors[0]},${colors[1]},${colors[2]}`;
	}

	private showError(errorMessage: string): void {
		this.isError = true;
		this.errorMessage = errorMessage;
		if (this.errorTimeoutHandler) {
			clearTimeout(this.errorTimeoutHandler);
		}
		this.errorTimeoutHandler = setTimeout(() => {
			this.isError = false;
			this.errorMessage = '';
		}, 4000);
	}
}
</script>

<style lang="scss" scoped>
.number-input {
	max-width: 120px !important;
}
</style>
