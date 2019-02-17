import * as fs from "fs-extra";
import * as path from "path";
import { isTsNode } from "../../init";
import { HttpController } from "../controllers/HttpController";
import { WebSocketController } from "../controllers/WebSocketController";
import { createImport } from '../tools/functions-inner';
import { Controller } from '../controllers/Controller';

const tryImport = createImport(require);
const Ext = isTsNode ? ".ts" : ".js";

async function loadControllers(controllerPath: string) {
    var files = await fs.readdir(controllerPath);

    for (let file of files) {
        let filename = path.resolve(controllerPath, file);
        let stat = await fs.stat(filename);

        if (stat.isFile() && path.extname(file) == Ext) {
            let ctor: typeof Controller = tryImport(filename).default;

            if (ctor && (
                (ctor.prototype instanceof WebSocketController) ||
                (ctor.prototype instanceof HttpController))
            ) {
                ctor.assign({ filename });
            }
        } else if (stat.isDirectory()) {
            // load files recursively.
            loadControllers(filename);
        }
    }
}

loadControllers(app.controllers.path);