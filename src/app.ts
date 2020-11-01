import express, {Request, Response} from 'express';
import xmlparser from "express-xml-bodyparser";

import {gcpservice} from "./index";
import {AddressInfo} from "net";
import {callbackHandle} from "./handlers";

import config from "./config";

const app: express.Application = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(xmlparser());

app.post('/', function (req: Request, res: Response) {
  gcpservice(req, res);
});

app.post('/api/v1/callback/:bank', function (req: Request, res: Response) {
    callbackHandle(req, res);
});

export default app;
