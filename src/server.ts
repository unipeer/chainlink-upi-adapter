import express from 'express';
import xmlparser from "express-xml-bodyparser";

import {gcpservice} from "./index";
import {AddressInfo} from "net";
import {callbackHandle} from "./handlers";

import config from "./config";

const app: express.Application = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(xmlparser());

app.post('/', function (req: any, res: any) {
    gcpservice(req, res);
});

app.post('/callback/:bank', function (req: any, res: any) {
    callbackHandle(req, res);
});

let listener = app.listen(config.EA_PORT, function () {
    let addressInfo = <AddressInfo>listener.address();
    console.log("Listening on ", addressInfo.address + addressInfo.port);
});

process.on('SIGINT', function () {
    process.exit();
});
