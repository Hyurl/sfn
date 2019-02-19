"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const sfn_1 = require("sfn");
const index_1 = require("./index");
const fs_extra_1 = require("fs-extra");
class DocController extends index_1.default {
    async docs(req, res) {
        let folders = (await fs_extra_1.readdir(sfn_1.ROOT_PATH + "/docs")).sort((a, b) => {
            return parseFloat(b.slice(1)) - parseFloat(a.slice(1));
        });
        let url = `/docs/${folders[0]}/getting-started`;
        if (req.query.lang)
            url += `?lang=${req.query.lang}`;
        return res.redirect(url);
    }
    async showContents(req, version, name) {
        try {
            let sideMenu = await app.services.docs.remote().getSideMenu(version, this.lang);
            let content = await app.services.docs.remote().getContent(version, this.lang, name);
            return req.xhr ? content : this.view("docs", Object.assign({}, this.indexVars, { sideMenu,
                content }));
        }
        catch (e) {
            let code = e.message.includes("no such file") ? 404 : 500;
            throw new sfn_1.HttpError(code, e.message);
        }
    }
}
tslib_1.__decorate([
    sfn_1.route.get("/docs"),
    sfn_1.route.get("/docs/"),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [sfn_1.Request, sfn_1.Response]),
    tslib_1.__metadata("design:returntype", Promise)
], DocController.prototype, "docs", null);
tslib_1.__decorate([
    sfn_1.route.get("/docs/:version/:name"),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [sfn_1.Request, String, String]),
    tslib_1.__metadata("design:returntype", Promise)
], DocController.prototype, "showContents", null);
exports.default = DocController;
//# sourceMappingURL=docs.js.map