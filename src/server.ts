import {AddressInfo} from "net";
import config from "./config";
import app from "./app";

const listener = app.listen(config.EA_PORT, function () {
    let addressInfo = <AddressInfo>listener.address();
    console.log("Listening on ", addressInfo.address + addressInfo.port);
});

process.on('SIGINT', function () {
    process.exit();
});
