<!-- title: View; order: 8 -->
## Concept

Since version 0.5.x, SFN introduces a new view system to resolve templates as
dynamic  modules in order to auto-load and hot-reload them.

## Example

In an HttpController, you can use [view()](/api/v1/HttpController#view) method
to display a template. (By default, the framework will not use any template
engine, just import the HTML file directly.)

```typescript
import { HttpController, route } from "sfn";

export default class extends HttpController {

    @route.get("/")
    index() {
        return this.view("index"); // the extension name will be .html.
    }
}
```

## Template Engines Loader

In modern web development, template engines are less important, so since 
0.5.x, SFN only provides two template engine loaders based on Alar engine. 

- [alar-ejs-loader](https://github.com/hyurl/alar-ejs-loader)
- [alar-pug-loader](https://github.com/hyurl/alar-pug-loader)

These loaders all return a module that includes a method 
`render(data: { [name: string]: any }): string`, when calling `view()` method, 
SFN will automatically calling `render()` to render the template.

You must learn these engines yourself, this documentation won't introduce them
in detail.

### Example of Using Ejs

NOTE: since v1.0, SFN switched from Alar to microse, although the old loader
still works in the new system because the module-loader is compatible between
the two engines, they should be imported using CommonJS `require()` function
instead, in order to prevent type errors when compiling the program since there
would be no Alar header files in the new system.

```typescript
// src/bootstrap/http.ts
const { EjsLoader } = require("alar-ejs-loader"); // use require instead of import

app.views.setLoader(new EjsLoader());
```

## Adapt Your Own Engines

If you have your own template engine, or you wish to use another template engine,
you can implement a new loader yourself, it's very easy, for example, an Ejs
loader can be implemented in the following way:

```typescript
import * as fs from "fs";
import * as ejs from "ejs";
import { ModuleLoader } from "microse";

export namespace EjsLoader {
    export interface View {
        render(data: { [name: string]: any }): string;
    }

    export interface Options {
        /**
         * Specifies encoding for loading the template (default: `utf8`).
         */
        encoding?: string;
        /** When `false` no debug instrumentation is compiled. */
        compileDebug?: boolean;
        /** Character to use with angle brackets for open/close. */
        delimiter?: string;
        /** Outputs generated function body. */
        debug?: boolean;
        /** When `true`, generated function is in strict mode. */
        strict?: boolean;
        /** 
         * Removes all safe-to-remove whitespace, including leading and trailing 
         * whitespace.
         */
        rmWhitespace?: boolean;
    }
}

export class EjsLoader implements ModuleLoader {
    extension = ".ejs";
    cache: { [filename: string]: EjsLoader.View } = {};

    constructor(private options: EjsLoader.Options = {}) { }

    load(filename: string) {
        if (this.cache[filename]) {
            return this.cache[filename];
        }

        let tpl = fs.readFileSync(filename, this.options.encoding || "utf8");

        return this.cache[filename] = {
            render: ejs.compile(tpl, {
                ...this.options,
                filename,
                cache: false,
                async: false
            })
        };
    }

    unload(filename: string) {
        delete this.cache[filename];
    }
}
```

More details about module loader, please check
[Microse ModuleLoader](https://github.com/microse-rpc/microse-node/blob/master/docs/api.md#moduleloader).
