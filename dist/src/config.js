"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Session = require("express-session");
const sessionFileStore = require("session-file-store");
const init_1 = require("./init");
;
const FileStore = sessionFileStore(Session);
exports.config = {
    env: process.env.NODE_ENV || "pro",
    lang: "en-US",
    enableDocRoute: false,
    awaitGenerator: false,
    workers: ["A"],
    statics: [init_1.SRC_PATH + "/assets"],
    watches: ["index.ts", "config.ts", "bootstrap", "controllers", "locales", "models"],
    server: {
        hostname: "localhost",
        timeout: 120000,
        autoStart: true,
        http: {
            type: "http",
            port: 80,
            options: null,
        },
        websocket: {
            enabled: true,
            port: undefined,
            options: {
                pingTimeout: 5000,
                pingInterval: 5000
            },
        },
        dgram: {
            enabled: true,
            port: 666
        },
        error: {
            show: true,
            log: true,
        }
    },
    database: {
        type: "mysql",
        host: "localhost",
        port: 3306,
        database: "modelar",
        user: "root",
        password: "161301"
    },
    session: {
        secret: "sfn",
        name: "sfn-sid",
        resave: true,
        saveUninitialized: true,
        unset: "destroy",
        store: new FileStore({
            path: init_1.ROOT_PATH + "/sessions",
            ttl: 3600 * 24
        }),
        cookie: {
            maxAge: 3600 * 24 * 1000
        }
    },
    mail: {
        pool: false,
        host: "",
        port: 25,
        secure: false,
        from: "",
        auth: {
            username: "",
            password: ""
        }
    },
    redis: {
        host: null,
        port: null
    }
};
//# sourceMappingURL=config.js.map