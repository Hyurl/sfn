import { HttpController, route } from "sfn";

export default class extends HttpController {
    @route.get("/")
    async index() {
        return this.throttle("index", async () => {
            await app.hooks.web.onView.invoke(this.req);
            return this.view("index");
        });
    }

    @route.sse("/sse-test")
    async *sseTest() {
        for await (let result of app.services.test.asyncIterator()) {
            yield result;
        }

        this.sse.close();
    }

    @route.get("/iterator-test")
    async *test() {
        for await (let result of app.services.test.asyncIterator()) {
            yield result;
        }
    }
}
