import { Router } from 'express';
const router = Router();

import { BAD_REQUEST, INTERNAL_SERVER_ERROR, NOT_FOUND, OK } from 'http-status-codes';
import { Color, DevicePropery, Discover, Yeelight } from 'yeelight-awesome';
import { IDeviceInfo } from '../common/DeviceInfo';
import { deserializeRGB } from '../common/utils';

import * as crypto from 'crypto';

let activeDevices: string[] = [];
const yeelights: Map<string, Yeelight> = new Map<string, Yeelight>();
const deviceInfoCache: Map<string, IDeviceInfo> = new Map<string, IDeviceInfo>();
let isStateCacheValid: boolean = false;

// Discover yeelight devices in local network
router.get('/devices/refresh', async (req, res) => {
    try {
        activeDevices = [];
        yeelights.clear();
        isStateCacheValid = false;
        await discoverDevices();

        const deviceInfoList = await getDevicesInfo();
        res.status(OK).json({ devices: deviceInfoList });
    }
    catch (err) {
        res.status(INTERNAL_SERVER_ERROR).send(err);
    }
});

// Get details of all devices
router.get('/devices', async (req, res) => {
    const deviceInfoList = await getDevicesInfo();
    res.status(OK).json({ devices: deviceInfoList });
});

// Toggle a specific device with id
router.get('/devices/:deviceId/toggle', async (req, res) => {
    const uid = req.params.deviceId;
    if (uid === undefined) {
        res.status(BAD_REQUEST).send('No id is specified');
        return;
    }
    if (yeelights.has(uid)) {
        try {
            const light = yeelights.get(uid);
            await connectDevice(light);
            await light.toggle();

            isStateCacheValid = false;
            res.status(OK).send(`Device toggled`);
        }
        catch (err) {
            res.status(INTERNAL_SERVER_ERROR).send(err);
        }
    }
    else {
        res.status(NOT_FOUND).send(`Device with id: ${uid} not found`);
    }
});

// Get specific device details with id
router.get('/devices/:deviceId', async (req, res) => {
    const uid = req.params.deviceId;
    if (uid === undefined) {
        res.status(BAD_REQUEST).send('No id is specified');
        return;
    }
    try {
        const deviceInfo = await getDeviceInfo(uid);
        res.status(OK).json({ device: deviceInfo });
    }
    catch (err) {
        res.status(INTERNAL_SERVER_ERROR).send(err);
    }
});

// Set brightness of a specific device with id
router.get('/devices/:deviceId/brightness', async (req, res) => {
    const uid = req.params.deviceId;
    const newValue = req.query.value;
    if (uid === undefined) {
        res.status(BAD_REQUEST).send('No id is specified');
        return;
    }
    else if (newValue === undefined) {
        res.status(BAD_REQUEST).send('No value is specified');
        return;
    }

    if (yeelights.has(uid)) {
        try {
            const light = yeelights.get(uid);
            await connectDevice(light);
            await light.setBright(Number(newValue));
            res.status(OK).send(`Device brightness changed`);
        }
        catch (err) {
            res.status(INTERNAL_SERVER_ERROR).send(err);
        }
    }
    else {
        res.status(NOT_FOUND).send(`Device with id: ${uid} not found`);
    }
});

// Set white color temperature of a specific device with id
router.get('/devices/:deviceId/temperature', async (req, res) => {
    const uid = req.params.deviceId;
    const newValue = req.query.value;
    if (uid === undefined) {
        res.status(BAD_REQUEST).send('No id is specified');
        return;
    }
    else if (newValue === undefined) {
        res.status(BAD_REQUEST).send('No value is specified');
        return;
    }
    if (yeelights.has(uid)) {
        try {
            const light = yeelights.get(uid);
            await connectDevice(light);
            await light.setCtAbx(Number(newValue));
            res.status(OK).send(`Device temperature changed`);
        }
        catch (err) {
            res.status(INTERNAL_SERVER_ERROR).send(err);
        }
    }
    else {
        res.status(NOT_FOUND).send(`Device with id: ${uid} not found`);
    }
});

// Set color mode of a specific device with id
router.get('/devices/:deviceId/color_mode', async (req, res) => {
    const uid = req.params.deviceId;
    if (uid === undefined) {
        res.status(BAD_REQUEST).send('No id is specified');
        return;
    }
    if (yeelights.has(uid)) {
        try {
            const light = yeelights.get(uid);
            await connectDevice(light);

            // tslint:disable-next-line: max-line-length
            const propertyEvent = await light.getProperty([DevicePropery.COLOR_MODE, DevicePropery.CT, DevicePropery.RGB]);
            const properties = propertyEvent.result.result;
            if (properties[0] === '1') {
                // Light is in color mode
                const currentCt = Number(properties[1]);
                await light.setCtAbx(currentCt, 'smooth');
            }
            else {
                // Light is in ct mode
                const currentColor = deserializeRGB(properties[2]);
                await light.setRGB(new Color(currentColor[0], currentColor[1], currentColor[2]), 'smooth');
            }
            res.status(OK).send('Device color mode changed');

        } catch (err) {
            res.status(INTERNAL_SERVER_ERROR).send(err);
        }
    }
    else {
        res.status(NOT_FOUND).send(`Device with id: ${uid} not found`);
    }
});

async function connectDevice(light: Yeelight): Promise<void> {
    if (light.connected === undefined) {
        await light.connect();
    }

    // const cmd = new Command(1, CommandType.SET_MUSIC, [1, ip.address(), port]);
    // const result = await light.sendCommand(cmd);
    // console.log(result);
}

async function getDevicesInfo(forceCache: boolean = false): Promise<IDeviceInfo[]> {
    if (forceCache) {
        isStateCacheValid = false;
    }
    if (isStateCacheValid) {
        return Array.from(deviceInfoCache.values());
    }
    else {
        deviceInfoCache.clear();

        for (const key of yeelights.keys()) {
            const deviceInfo = await getDeviceInfo(key);
            deviceInfoCache.set(key, deviceInfo);
        }

        isStateCacheValid = true;
        return Array.from(deviceInfoCache.values());
    }
}

async function getDeviceInfo(key: string): Promise<IDeviceInfo> {
    if (isStateCacheValid) {
        return deviceInfoCache.get(key);
    }
    else {
        if (yeelights.has(key)) {
            const light = yeelights.get(key);

            await connectDevice(light);
            // tslint:disable-next-line: max-line-length
            const propertyEvent = await light.getProperty([DevicePropery.NAME, DevicePropery.POWER, DevicePropery.BRIGHT,
            DevicePropery.COLOR_MODE, DevicePropery.RGB, DevicePropery.CT]);
            const properties = propertyEvent.result.result;
            const deviceInfo: IDeviceInfo = {
                id: key,
                name: properties[0],
                power: properties[1] === 'on',
                bright: properties[2],
                color_mode: properties[3] === '1' ? 'color' : 'white',
                rgb: properties[4],
                ct: properties[5],
            };

            return deviceInfo;
        }
    }
}

export async function discoverDevices() {
    const discover = new Discover({});
    const devices = await discover.scanByIp();
    for (const device of devices) {
        if (activeDevices.includes(device.host)) {
            return;
        } else {
            activeDevices.push(device.host);
            const uid = crypto.randomBytes(16).toString('hex');
            yeelights.set(uid, new Yeelight({ lightIp: device.host, lightPort: device.port }));
        }
    }

    // Build state cache
    await getDevicesInfo(true);
}

export default router;
