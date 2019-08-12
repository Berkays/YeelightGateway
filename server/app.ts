import { config } from 'dotenv';
config();

import { createWriteStream } from 'fs';
import * as path from 'path';

import express from 'express';
import morgan from 'morgan';

import ApiRouter from './routes';

import { discoverDevices } from './routes';

const entryPath = path.resolve('./build/client/index.html');
const publicPath = path.join(__dirname, '..', 'client');


// Init express
const app = express();

// Init middlewares
if (process.env.NODE_ENV === 'production') {
    const accessLogStream = createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
    app.use(morgan('combined', { stream: accessLogStream }));
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(publicPath));

// Bind routes
app.get('/', (req, res) => {
    res.sendFile(entryPath);
});

app.use('/api', ApiRouter);

// Start initial yeelight discovery
discoverDevices();

export default app;
