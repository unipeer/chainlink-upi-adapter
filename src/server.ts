import express from 'express';

import {gcpservice} from "./index";
import {AddressInfo} from "net";
import {callbackHandle} from "./handlers";
import xmlparser from "express-xml-bodyparser";

const app: express.Application = express();
app.use(xmlparser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.post('/', function (req: any, res: any) {
    gcpservice(req, res);
});

app.post('/callback/:bank', function (req: any, res: any) {
    callbackHandle(req, res);
});

let listener = app.listen(process.env.EA_PORT || 8080, function () {
    let addressInfo = <AddressInfo>listener.address();
    console.log("Listening on ", addressInfo.address + addressInfo.port);
});

process.on('SIGINT', function () {
    process.exit();
});
