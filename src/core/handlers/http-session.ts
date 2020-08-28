import * as ExpressSession from "express-session";
import { intercept } from "function-intercepter";
import { router } from "../bootstrap/index";
import { Response } from "../tools/interfaces";

type SessionHandler = (req: any, res: any, next: Function) => void;

export var session: SessionHandler = null;

if (typeof app.config.session === "object") {
    session = ExpressSession(app.config.session);

    router.use(session)
        .use(async (req, res: Response, next) => { // fix 'sent' property
            res.sent = false;
            res.end = intercept(res.end).before(() => {
                res.sent = true;
            });
            await next();
        });
}
