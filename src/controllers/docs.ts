import { route, HttpError, ROOT_PATH, Request, Response, Session } from "sfn";
import IndexController from "./index";
import { readdir } from 'fs-extra';

declare global {
    namespace app {
        namespace controllers {
            const docs: ModuleProxy<DocController>;
        }
    }
}

export default class DocController extends IndexController {
    @route.get("/docs")
    @route.get("/docs/")
    async docs(req: Request, res: Response) {
        let folders = (await readdir(ROOT_PATH + "/docs")).sort((a, b) => {
            return parseFloat(b.slice(1)) - parseFloat(a.slice(1));
        });
        let url = `/docs/${folders[0]}/getting-started`;

        if (req.query.lang)
            url += `?lang=${req.query.lang}`;

        return res.redirect(url);
    }

    @route.get("/docs/:version/:name")
    async showContents(req: Request, version: string, name: string) {
        try {
            let sideMenu = await app.services.docs.remote().getSideMenu(version, this.lang);
            let content = await app.services.docs.remote().getContent(version, this.lang, name);

            return req.xhr ? content : this.view("docs", {
                ...this.indexVars,
                sideMenu,
                content
            });
        } catch (e) {
            let code = (<Error>e).message.includes("no such file") ? 404 : 500;
            throw new HttpError(code, e.message);
        }
    }
}