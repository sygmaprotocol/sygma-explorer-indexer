"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const PORT = Number(process.env.PORT) || 8000;
app_1.app.listen({ port: PORT }, (err, address) => {
    if (err) {
        app_1.app.log.error(err);
        process.exit(1);
    }
    console.log(`⚡️[server]: Server is running at ${address}`);
});
//# sourceMappingURL=index.js.map