import express from 'express';
import config from './config/env.js';
import morgan from 'morgan';
import AuthRouter from "./modules/Auth/Auth.routes.js";
import VideoRouter from "./modules/Video/Video.routes.js";
import { globalError, notFound } from './middlewares/globalError.js';

const app = express();

app.use(morgan('dev'));

app.use("/api/v1/auth", AuthRouter);
app.use("/api/v1/video", VideoRouter);

app.use(notFound);
app.use(globalError);

app.listen(config.PORT, () => {
    console.log('server in development');
})