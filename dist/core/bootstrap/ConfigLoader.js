"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const merge = require("lodash/merge");
const startsWith = require("lodash/startsWith");
const init_1 = require("../../init");
const config_1 = require("../../config");
exports.config = config_1.config;
const chalk_1 = require("chalk");
const Mail = require("sfn-mail");
const functions_inner_1 = require("../tools/functions-inner");
let moduleName = init_1.APP_PATH + "/config";
if (!startsWith(__filename, init_1.APP_PATH) && functions_inner_1.moduleExists(moduleName)) {
    let m = require(moduleName);
    if (typeof m.config == "object") {
        merge(config_1.config, m.config);
    }
    else if (typeof m.default == "object") {
        merge(config_1.config, m.default);
    }
    else if (typeof m.env == "string") {
        merge(config_1.config, m);
    }
}
let { server: { hostname, http: { port, type } } } = config_1.config, host = hostname + (port == 80 || port == 443 ? "" : ":" + port);
exports.baseUrl = (type == "http2" ? "https" : type) + "://" + host;
exports.isDevMode = init_1.isDebugMode || !process.send;
if (exports.isDevMode && !init_1.isDebugMode && !init_1.isCli) {
    console.log("You program is running in development mode without "
        + "'--inspect' flag, please consider changing to debug environment.");
    console.log("For help, see "
        + chalk_1.default.yellow("https://sfnjs.com/docs/v0.3.x/debug"));
}
Mail.init(config_1.config.mail);
//# sourceMappingURL=ConfigLoader.js.map