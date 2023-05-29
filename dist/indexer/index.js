"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const client_1 = require("@prisma/client");
const indexer_1 = require("./indexer");
const getSygmaConfig_1 = require("../utils/getSygmaConfig");
const prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const sygmaconfig = yield (0, getSygmaConfig_1.getSygmaConfig)();
        yield prisma.$connect();
        const deleteTransfers = prisma.transfer.deleteMany();
        yield prisma.$transaction([deleteTransfers]);
        const evmBridges = sygmaconfig.chains.filter((c) => c.type !== "Substrate");
        for (const bridge of evmBridges) {
            yield (0, indexer_1.indexDeposits)(bridge, sygmaconfig);
        }
        console.log("\n***\n");
        for (const bridge of evmBridges) {
            yield (0, indexer_1.indexProposals)(bridge, sygmaconfig);
        }
        console.log("\n***\n");
        for (const bridge of evmBridges) {
            yield (0, indexer_1.indexFailedHandlerExecutions)(bridge, sygmaconfig);
        }
    });
}
main()
    .catch((e) => {
    console.error(e);
    throw e;
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
    console.log("\ndisconnect");
    process.exit();
}));
//# sourceMappingURL=index.js.map