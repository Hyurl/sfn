<!-- title: Security; order: 10 -->
# Authorization

Both `HttpController` and `WebSocketController` provide a simple approach to 
control user authorization.

When an HTTP request or socket.io event fires, the framework will try to 
retrieve information of the logged-in user. The way that the framework checks 
if any user logged-in is by checking if there is a `session` key-value pair 
named `uid` valid, if the `uid` exists, then try to get the user instance and 
assign it to the `req.user` or `socket.user` property.

If any user retrieved, that the user is seemed logged-in. You can [define your 
own `User` class](./orm-model#The-User-Model) in `src/models/` directory to 
extend the default `modelar.User` class, otherwise the default one will be used.

So if you want to set a user's state to logged-in, you just need to set 
`req.session.uid` or `socket.session.uid` to the user ID, and that's done. 
Remember, sessions in an **SFN** application are shared between HTTP and 
WebSocket, that means once you changed one side, the other side will be 
modified as well.

In the controller, there is a property `authorized`, if it's `true`, that 
means the operation is permitted, `false` the otherwise. By default it just 
check if `req.user !== null` (or `socket.user !== null`), you can set a more 
complicated checking condition to suit your needs.

If an operation is unauthorized, the framework will throws an HttpError 
(or SocketError) `401 Unauthorized` to the client.

## How To Require Authentication?

Very easy, you just use the decorator `@requireAuth` to decorate the method, 
when it is call by the URL (or WebSocket events), the checking procedure will 
be automatically performed.

### Example

```typescript
import { HttpController, Request, Response, route, requireAuth } from "sfn";

export default class extends HttpController {
    constructor(req: Request, res: Response) {
        super(req, res);

        // instead of checking req.user, here I will check req.auth, HTTP 
        // basic authentication.
        this.authorized = req.auth !== null
            && req.auth.username === "luna"
            && req.auth.password === "12345";

        // Since this is a HttpController, you can set 'fallbackTo' property a
        // URL, so that when unauthorized, instead of throwing 401 error, 
        // redirect to the given URL.
        this.fallbackTo = "/auth";
    }

    @requireAuth
    @route("/auth-example")
    index() {
        return "This message will be sent if the operation is permitted.";
    }

    @route("/auth")
    auth(req: Request, res: Responce) {
        if (!req.auth) {
            // res.auth() will lead you to HTTP basic authentication.
            return res.auth();
        } else {
            return "User has been authorized.";
        }
    }
}
```

The above example shows you directly check authorization state in the 
constructor since it's all synchronous, but most of the case you will need to do
some async operations before checking, say retrieving data from the database, 
you will need to have a look at 
[Before And After Operations](./http-controller#Before-And-After-Operations) and
[Aspect Oriented Programing](./aop-mixins#Aspect-Oriented-Programing).

# CSRF Protection

CSRF security issue is a very old topic actually, in my experience, modern 
browsers have done a lot of work to protect it for you. But just in case, you 
may need to do your own protection as well.  

CSRF protection in an **SFN** application is very easy, you just need to turn 
it on in the HttpController.

```typescript
import { HttpController, route } from "sfn";

export default class extends HttpController {
    csrfProtection = true; // turn on CSRF protection

    @route.get("/")
    index() {
        // you can get the token and pass it to the view.
        let token: string = this.csrfToken;
        return this.view("index", { token });
    }

    @route.post("/csrf-test")
    csrfTest() {
        // When this method is about to be called, the framework will 
        // automatically check whether the csrf token is matched. if not, a 
        // 403 Forbidden error will be thrown, and this method will never be 
        // called.
        return "CSRF checking passed.";
    }
}
```

### Inject CSRF Token Automatically

You can use the function `injectCsrfToken()` to inject the CSRF token into 
HTML forms for you, but you need to make sure that your view file is written 
well-formatted, and it only support HTML files (or **ejs** templates).

```typescript
import { HttpController, route, injectCsrfToken } from "sfn";

export default class extends HttpController {
    csrfProtection = true;

    @route.get("/")
    async index() {
        // you can get the token and passed to the view.
        let token: string = this.csrfToken;
        let html = await this.view("index");
        return injectCsrfToken(html, token);
    }
}
```

### Sending the CSRF Token Back To the Server

On client side, you just need to send a field `x-csrf-token` that carries the 
token along with your data via any of these approaches:

- `HTTP request header` for Ajax.
- `URL search string` e.g. `?x-csrf-token={token}`
- `request body` a.k.a. HTML forms.

When you're request with these HTTP methods, you must send the token, otherwise
a `403 Forbidden` will be thrown.

- `DELETE`
- `PATCH`
- `POST`
- `PUT`

## CORS Control

Allowing requests from untrusted origins will make some troubles, although 
modern browsers more intend to block response from cross origin requests, but 
on the server side, the operation will be performed as usual, even the remote 
client will never notice.

**SFN** framework give you the ability to fully control CORS, and it is very 
easy to configure. As usual, you just need to turn it on in the controller.

### Example of CORS

```typescript
import { HttpController, route } from "sfn";

export default class extends HttpController {
    cors = "example.com";

    // ...
}
```

In this example, only the trusted origin `example.com` can now access the URLs
bound to the controller.

`cors` property can be set these values:

- **a single hostname** or an array that carries **several hostnames** to 
    accept particular origins.
- **an asterisk (`*`)** to accept all origins.
- **an object** that carries these information:
    - `origins: string | string[]` the same as the above two rules.
    - `methods?: string | string[]` accepts particular HTTP request methods.
    - `headers?: string | string[]` accepts particular HTTP request headers.
    - `credentials?: boolean` allow credentials.
    - `maxAge?: number` how long the results of a preflight request can be 
        cached.
    - `exposeHeaders?: string | string[]` lets a server whitelist headers 
        that browsers are allowed to access.

More details, see 
[Cross-Origin Resource Sharing (CORS)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS).

The framework uses [sfn-cors](https://github.com/Hyurl/sfn-cors) module to 
perform CORS control, it enhances the legacy CORS Access Control Checking, 
allows you checking multiple origins in multiple forms. Possible host
specifications are:

- `https://github.com` allow only https scheme for this host.
- `http://github.com` allow only http scheme for this host.
- `github.com` allow any scheme for this host.
- `*.github.com` allow any sub-domain including second-level domain itself.
- `https://*.github.com` same as above but restrict for https only.
- `github.com:*` allow any port for this host.
- `*.github.com:*` allow any port for this host and any sub-domain.
- `https://*.github.com:*` same as above but restrict for https only.

Some browsers, like Chrome, won't check `Access-Control-Allow-Methods` and 
`Access-Control-Allow-Headers`, or check weakly, but using this module,
methods and headers are always strictly checked.

When Access Control Checking failed, or the request method is `OPTIONS` 
(whatever succeeded or failed), the connection will be immediately 
terminated and no more operations will be run after that.

## XSS Protection

XSS attacks are way more danger than CSRF and CORS. There is a golden rule that 
works at any time: **Never trust user input**. If without any escaping, the 
hacker may inject dangerous code in your website, and do harm when other users
visit the dangerous page.

To protect your website being hacked from an XSS attack, **SFN** provides some
useful functions that allow you escape unsafe code in the user input.

The framework uses [sfn-xss](https://github.com/Hyurl/sfn-xss) module to back 
these escapes.

### Escape HTML Tags

The function `escapeTags()` is used to escapes HTML tags that might run any 
unsafe code. By default, these tags will be escaped:

- `<script>`
- `<style>`
- `<iframe>`
- `<object>`
- `<embed>`

You can specify the second argument `tags` to customize what tags you need to 
escape.

```typescript
import { escapeTags } from "sfn";

var html = "<script>document.write('You are being hacked.')</script>";
var escaped = escapeTags(html);

console.log(escaped);
// => &lt;script&gt;document.write('You are being hacked.')&lt;/script&gt;
```

The tags will be changed to safe entities, so that the code will not be run and
the input contents can be displayed properly.

### Escape Script Links

The function `escapeScriptHrefs()` is used to escape `href` attributes that may
contain scripts.

```typescript
import { escapeScriptHrefs } from "sfn";

var html2 = `<a href="javascript:document.write('You are being hacked.');">`;
var escaped2 = escapeScriptHrefs(html2);

console.log(escaped2);
// <a data-href="jscript:document.write('You are being hacked.');">
```

The `href` attribute will be changed to `data-href`, so that the code will 
never be run.

### Escape Event Attributes

The function `escapeEventAttributes()` is sued to escape event attributes, 
e.g. `onclick`, `onmouseover`, they will be prefixed with a `data-` as well.

```typescript
import { escapeEventAttributes } from "sfn";

var html3 = `<button onclick="document.write('You are being hacked.')">`;
var escaped3 = escapeEventAttributes(html3);

console.log(escaped3);
// <button data-onclick="document.write('You are being hacked.')">
```

## Validate Forms

XSS escaping functions sometimes don't work as well as you'd expect, so there 
is another option you can choose, using a form validator to check user input.

The framework recommended using 
[sfn-validator](https://github.com/Hyurl/sfn-validator) to check use input, you 
can learn more information about it on GitHub.

### Example

```typescript
import { HttpController, Request, Validator, route } from "sfn";
import { User, NotFoundError } from "modelar"

let validator = new Validator({
    email: {
        type: "email",
        length: [5, 25]
    },
    password: {
        type: "string",
        length: [3, 18]
    }
});

export default class extends HttpController {

    @route.post("/login")
    async login(req: Request) {
        try {
            validator.validate(req.body);

            let email = req.body.email,
                password = req.body.password,
                user = await User.use(this.db).login({ email, password });

            req.session.uid = user.id;

            return this.success(user);
        } catch (err) {
            return this.error(err, err instanceof NotFoundError ? 404 : 400);
        }
    }
}
```