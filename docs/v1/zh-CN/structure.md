<!-- title: 结构预览; order: 2 -->
## 文件和文件夹

在一个标准的 **SFN** 应用中，总有一些文件和文件夹会出现在你的项目目录中，它们中的一些
是必须的，而另一些则只是建议使用。

- `cache/` 存储缓存备份的目录。
- `dist/` 存储编译文件的发布目录。
- `logs/` 存储日志文件的目录。
- `node_modules/` 存储已安装的 NodeJS 模块的目录。
- `sessions/` 存储会话文件的目录，仅在使用 `session-file-store` 模块时出现。
- `src/` 存储所有源代码的目录。
    - `assets/` 存储静态文件的目录。
    - `bootstrap/` 存储启动自定义文件的目录。
        - `index.ts` 默认的启动自定义文件。
        - `http.ts` 和 HTTP 控制器有关的启动自定义文件。
        - `websocket.ts`  和 WebSocket 控制器有关的启动自定义文件。
        - 其他启动自定义文件必须由 `index.ts` 来加载。
    - `controllers/`* 存储控制器文件的目录。
    - `locales/`* 存储语言包文件的目录。
    - `models/`* 存储模型文件的目录。
    - `hooks`* 存储钩子文件的目录。
    - `services/`* 存储独立服务文件的目录。
    - `utils/`* 存储功能模块文件的目录。
    - `views/`* 存储视图文件的目录。
    - `config.ts` 项目配置文件，可以从这个文件中加载其他的配置文件并合并到默认导出。
    - `index.ts` 服务器入口文件。
- `package.json` 项目的说明文件。
- `package-lock.json`
- `tsconfig.json` TypeScript 编译器配置文件。

除了列举的这些，你可以创建任何你想要的文件和文件夹，只需要保证它们会被适当地加载即可。

（注：* 表示该项目下的文件支持热重载。）

## 热重载提示

热重载特性提供了应用热重载修改了源代码的模块而无需重启程序，然而这还有很多东西需要考虑，因为你的
程序将会自动重载被导入的模块，这意味着任何状态、内存中的缓存、变量等，都会在模块重载之后被擦除。
你必须要改变你的开发习惯，并将你的程序设计成无状态的，或者实现一中方式来在服务暂停时保存状态（
在 [destroy()](/api/v1/Service#destroy) 方法中），并在服务重载后恢复状态（在 
[init()](/api/v1/Service#init) 方法中）。如果这对你来说有困难，只需要关闭热重载特性，
就没问题了。

### 配置热重载

热重载配置可在配置文件的 `watch` 选项汇中设置，示例如下：

```ts
// src/config.ts
export default <app.Config>{
    // ...
    watch: [ // configured modules will be hot-reloadable
        app.controllers,
        app.views,
        app.locales,
        app.hooks,
        app.services,
        app.utils
    ],
    // ...
}
```
