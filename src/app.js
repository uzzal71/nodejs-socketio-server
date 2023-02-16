import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

dotenv.config();

import configureRoutes from "./routes/index";
import { errorLogger } from "./logger";

// extra security packages
import helmet from 'helmet';
import cors from 'cors';
import xss from 'xss-clean';
require('express-async-errors');


const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(helmet());
app.use(xss());
app.use(session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: true,
    cookie: {maxAge: 1000 * 60 * 60 * 24}, // oneDay
    resave: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

configureRoutes(app);

errorLogger.error('This is error generate')

export default app;