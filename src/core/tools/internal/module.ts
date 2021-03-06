import * as path from "path";
import * as fs from "fs-extra";
import * as FRON from "fron";
import { ModuleProxy } from "microse";
import { isTsNode } from "../../../init";
import { tryLogError, resolveErrorStack } from './error';
import merge = require('lodash/merge');
import { Locale } from "../interfaces";
import get = require('lodash/get');

const Module: new (...args: any[]) => NodeJS.Module = <any>module.constructor;
const tryImport = createImport(require);

export function moduleExists(path: string): boolean {
    return fs.existsSync(path + (isTsNode ? ".ts" : ".js"));
}

/**
 * Used to create a `require`-like function, unlike the regular require function,
 * the created function will not throw error if the module doesn't exist,
 * instead if returns an empty object `{}`, and the function supports JSONC
 * (JSON with Comments) files by default.
 */
export function createImport(require: NodeRequire): (id: string) => {
    [x: string]: any;
    default?: any;
} {
    return (id: string) => {
        try {
            let filename = require.resolve(id);

            // Support JSONC (JSON with comment) files.
            if ([".json", ".jsonc"].includes(path.extname(filename))) {
                let _module: NodeJS.Module = require.cache[filename];

                if (!_module) {
                    _module = new Module(filename, module);
                    require.cache[filename] = _module;
                    Object.assign<NodeJS.Module, Partial<NodeJS.Module>>(_module, {
                        require,
                        filename,
                        exports: FRON.parse(fs.readFileSync(filename, "utf8")),
                        loaded: true,
                        paths: module.paths
                    });
                }

                return _module.exports;
            } else {
                return require(id);
            }
        } catch (err) {
            err.stack = resolveErrorStack(err.stack, null, 1).stack;
            tryLogError(err);
            return {};
        }
    };
}

export function traceModulePath(baseDir: string) {
    let target = { stack: "" };

    Error.captureStackTrace(target);

    let { filename } = resolveErrorStack(target.stack, baseDir);
    let ext: string;

    if (!filename)
        return;

    if (ext = path.extname(filename)) {
        filename = filename.slice(0, -ext.length);
    }

    return filename;
}

export async function importDirectory(dir: string) {
    let ext = isTsNode ? ".ts" : ".js";
    let files = await fs.readdir(dir);

    for (let file of files) {
        let filename = path.resolve(dir, file);
        let stat = await fs.stat(filename);

        if (stat.isFile() && path.extname(file) == ext) {
            tryImport(filename);
        } else if (stat.isDirectory()) {
            // load files recursively.
            await importDirectory(filename);
        }
    }
}

export function loadLanguagePack(filename: string) {
    let name = app.locales.resolve(filename);
    let mod = name ? (<ModuleProxy<Locale>>get(global, name)) : null;

    if (mod?.exports) {
        let lang = path.basename(filename, path.extname(filename));
        app.locales.translations[lang] = mod.exports;

        if (mod.exports.$alias) {
            let aliases = mod.exports.$alias.split(/\s*,\s*/);

            for (let alias of aliases) {
                app.locales.translations[alias] = mod.exports;
            }
        }
    }
}

export function loadConfig() {
    let configFile = app.APP_PATH + "/config";
    let config = require("../../../config");

    if (moduleExists(configFile)) {
        // Load user-defined configurations.
        let mod = tryImport(configFile);

        if (!Object.is(mod, config) && typeof mod.default == "object") {
            merge(config.default, mod.default);
        }
    }

    return config.default as app.Config;
}

/**
 * NOTE: This function is called in the following files:
 * - ../../../index.ts
 * - ../../../../index.js
 */
export function bootstrap() {
    if (!app.isCli) {
        // Load user-defined bootstrap procedures.
        let bootstrap = app.APP_PATH + "/bootstrap/index";

        moduleExists(bootstrap) && tryImport(bootstrap);

        // load hooks
        fs.pathExists(app.hooks.path).then(async (exists) => {
            exists && (await importDirectory(app.hooks.path));
        });

        loadConfig(); // load configs
    }

    if (fs.existsSync(app.locales.path)) {
        fs.readdirSync(app.locales.path).forEach(filename => {
            loadLanguagePack(app.locales.path + "/" + filename);
        });
    }
}
