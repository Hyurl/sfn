<!-- title: WebSocket 控制器; order: 5 -->
## 基本概念

[WebSocketController](/api/v1/WebSocketController) 处理来自
[socket.io](https://socket.io/) 客户端的消息。

由于这个模块使用 socket.io，你需要提前学习它，从而能够完全处理你的工作。

## 使用示例

如同 **HttpController**，你创一个文件存储在 `src/controllers` 中，这个文件应该导出
一个默认的类并继承自 `WebSocketController`，然后它就能够在服务器启动时被自动加载。

很多 **HttpController** 中的特性，在 **WebSocketController** 中都可以使用，或者
可以找到相似的版本，所以请认真查看 [HttpController](./http-controller) 的文档。

```typescript
import { WebSocketController, event } from "sfn";

export default class extends WebSocketController {
    @event("/demo")
    async index() {
        return "Hello, World!";
    }
}
```

## 事件和方法的关系

当一个方法被 [@event](/api/v1/decorators#event) 修饰时，这个方法将会被绑定到一个确定的
socket.io 事件上。当一个客户端发送数据到这个事件上时，这个方法就会被自动地调用，其返回值将会被
自动地以合适的形式返回给客户端。

1. 如果客户端在发送消息时指定了回调函数，如 `emit(event, message, callback)`, 那么返回值
    将会被发送到回调函数中。
2. 如果客户端没有指定回调函数，那么返回值将会被发送到与相同的事件中，客户端可以通过绑定事件
    回调函数来接收服务端返回的数据。


### 设置命名空间

默认地，WebSocket 事件被绑定到根命名空间 `/`，你可以设置静态属性 `nsp` 来修改为其他的
路径。

```typescript
export default class extends WebSocketController {
    static nsp = "/api";

    /**
     * @example
     * var socket = io.connect("http://localhost/api")
     */
    @event("/user/:uid")
    getUser(uid: number) {
        // ...
    }
}
```

## 方法的签名

所有在 WebSocketController 中绑定到唯一事件上的方法支持任何个数的参数，它们和 
SocketIO 客户端发送得数据是一一对应的：

```typescript
import { WebSocketController, WebSocket, event } from "sfn";

export default class extends WebSocketController {
    /**
     * On client side:
     *      socket.emit("event1", "Hello, World!");
     */
    @event("/event1")
    event1(str: string) {
        return str; // => 'Hello, World!'
    }

    /**
     * On client side:
     *      socket.emit("event2", "Hello, World!", "Hi, sfn!");
     */
    @event("event2")
    event2(str: string, str2: string) {
        return [str, str2]; // => ['Hello, World!', 'Hi sfn!']
    }
}
```

更多详情请查看 [依赖注入](./di#在控制器中自动注入)。

### 构造函数签名

所有的 WebSocketController 构造函数都支持一个参数，即 `socket`
[\<WebSocket\>](/api/v1/WebSocket)。

```typescript
import { WebSocketController, WebSocket } from "sfn";

export default class extends WebSocketController {
    constructor(socket: WebSocket) {
        super(socket);
        // your stuffs...
    }
}
```

## 抛出状态异常

和在 HttpController 中一样，你可以使用 [HttpException](/api/v1/HttpException) 来抛出
异常，框架将会对其进行合适的处理，并自动地发送错误响应内容。

```typescript
import { WebSocketController, HttpException, event } from "sfn";

export default class extends WebSocketController {
    @event("/example")
    example() {
        let well: boolean = false;
        let msg: string;
        // ...
        if (!well) {
            if (!msg)
                throw new HttpException(400); // => 400 bad request
            else
                throw new HttpException(400, msg); // => 400 with customized message
        }
    }
}
```

当一个 HttpException 被抛出时，框架总是会发送一个包含着 
`{success: false, code, error}` 的消息到客户端，这个响应形式来自于控制器方法
[fail()](./http-controller#通用-API-响应)。

## 绑定多个方法与返回多个值

在 WebSocket 控制器中，如果多个方法被绑定到了同一个事件上，那么这些方法将会按照其定义的
顺序被依次调用，其返回值也会被依次发送给客户端。即使绑定了多个方法，一个控制器也只会被
实例化一次，`init()` and `destroy()` 方法也只会被调用一次，但如果事件绑定在了多个控制器
内，那么这些控制器都会被依次实例化，并且调用其 `init()` 和 `destroy()` 方法。并且，如果
方法是一个生成器，那么该方法所 `yield` 的值也会被依次发送（通过同名事件）。因此，你也可以使用
生成器来持续地向客户端返回数据。

```typescript
import { WebSocketController, WebSocket, event } from "sfn";

export default class extends WebSocketController {
    @event("generator-example")
    async *index(socket: WebSocket) {
        let i = 0;

        while (true) {
            yield i++;

            if (i === 10) {
                break;
            }
        }

        // the client will receive these data continuously.
        // { done: false, value: 1 }
        // { done: false, value: 2 }
        // ...
        // { done: false, value: 10 }
        // { done: true, value: value }
    }
}
```

**注意：自 v1.0 起，从 WebSocket 控制器的生成器方法中产出的数据将会以**
**`{done: bool, value: any}` 的形式发送给客户端，客户端可以检查 `done` 属性，进而判断**
**是否已经传输完所有数据。**

## 自定义 Adapter

SFN 使用 SocketIO 来启动 WebSocket 服务，因此你可以使用所有 SocketIO 的特性，包括
自定义 Adapter, 内置的 WebSocket 会话数据存储在内存中，这样会带来很多不便，例如多个
进程间无法共享在线用户信息，并且在进程重启时会导致用户状态失效等。因此建议是使用另外的
Adapter，例如 [socket.io-redis](https://www.npmjs.com/package/socket.io-redis)，
关于 Redis 的好处我就不多说了，你可以自行去了解。

```typescript
// <SRC_PATH>/bootstrap/websocket.ts
import "sfn";
import * as RedisAdapter from "socket.io-redis";

app.ws.adapter(RedisAdapter({ host: "localhost", port: 6379 }));
```

#### 注意

在使用 `socket.io-redis` 模块后，当调用
[app.message.ws](./message-channel#推送-WebSocket-消息) 来推送消息时，需要使用 `via()`
方法指定用来发送消息的前端 Web 服务器，否则消息可能会被重复发送。
