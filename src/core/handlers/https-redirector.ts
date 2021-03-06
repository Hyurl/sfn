import { createServer, STATUS_CODES } from "http";
import { red } from "../tools/internal/color";
import { version } from "../../init";

let server = app.config.server.http;

if (server.type == "https" || server.type == "http2") {
    // redirect all HTTP request to HTTPS.
    createServer((req, res) => {
        let port = server.port == 443 ? "" : ":" + server.port;
        res.setHeader("Server", `NodeJS/${process.version}`);
        res.setHeader("X-Powered-By", `sfn/${version}`);
        res.setHeader("Location", "https://" + req.headers.host + port + req.url);
        res.statusCode = 301;
        res.statusMessage = STATUS_CODES[301];
        res.end(res.statusMessage);
    }).on("error", (err) => {
        if (err.message.match(/EADDRINUSE/)) {
            console.error(red`Failed to redirect HTTP: ${err.message}`);
        }
    }).listen(80);
}