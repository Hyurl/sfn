import { ModuleProxyApp, ModuleProxy, FSWatcher } from "microse";
import * as fs from "fs";
import { View } from "sfn";
import startsWith = require('lodash/startsWith');
import get = require('lodash/get');
import define from '@hyurl/utils/define';

declare global {
    namespace app {
        const docs: ModuleProxyApp & { [name: string]: ModuleProxy<View>; };
    }
}

// add new module proxy to auto-load and hot-reload markdown documentations
define(app, "docs", new ModuleProxyApp("app.docs", app.ROOT_PATH + "/docs"));

app.docs.setLoader({
    cache: {},
    extension: ".md",
    load(file) {
        if (!this.cache[file]) {
            let contents = fs.readFileSync(file, "utf8");

            contents = app.utils.markdown.parse(contents);
            this.cache[file] = {
                render: () => {
                    return contents;
                }
            };
        }

        return this.cache[file];
    },
    unload(file) {
        delete this.cache[file];
    }
});


// Rewrite watch method for more advanced functions.
const _watch: () => FSWatcher = app.docs.watch.bind(app.docs);
app.docs.watch = () => {
    return _watch().on("change", reload).on("unlink", reload);
};


async function reload(file: string) {
    let parts = file.slice(app.docs.path.length + 1).split(/\\|\//);
    let lang = parts[1];

    if (startsWith(app.id, "doc-server")
        || !app.rpc.isConnectedTo("doc-server")
    ) {
        let path = `app.docs.sideMenu.${parts[0]}.${lang}`;

        await app.services.cache.delete(path);
    }

    if (startsWith(app.id, "web-server")) {
        // Use WebSocket to reload the web page.
        let name = app.docs.resolve(file);
        let view: ModuleProxy<View> = get(global, name);
        let data = await view?.render();
        let type = lang === "api" ? "api" : "docs";
        let pathname = `/${type}/${parts[0]}/${parts.slice(2).join("/").slice(0, -3)}`;

        if (type === "api")
            lang = "";

        data = data.replace(
            /&lt;([a-zA-Z0-9_\.]+?(\[\])?)&gt;/g,
            "<var>&lt;$1&gt;</var>"
        );
        app.message.ws.local.emit("renew-doc-contents", pathname, lang, data);
    }
}
