"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const init_1 = require("../../init");
const functions_inner_1 = require("../tools/functions-inner");
exports.LocaleMap = {};
const Ext = init_1.isTsNode ? ".ts" : ".js";
function loadLocales(dir) {
    if (fs.existsSync(dir)) {
        let files = fs.readdirSync(dir);
        for (let file of files) {
            let ext = path.extname(file);
            if (ext == Ext || ext == ".json") {
                let name = path.basename(file, ext).toLowerCase(), lang = functions_inner_1.loadLanguagePack(dir + "/" + file);
                exports.LocaleMap[name] = lang;
            }
        }
    }
}
loadLocales(init_1.APP_PATH + "/locales");
//# sourceMappingURL=LocaleMap.js.map