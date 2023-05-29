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
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function resetDB() {
    return __awaiter(this, void 0, void 0, function* () {
        yield prisma.$connect();
        console.log("You're DB will be cleaned");
        const deleteTransfers = prisma.transfer.deleteMany();
        yield prisma.$transaction([deleteTransfers]);
        yield prisma.$disconnect();
    });
}
resetDB().catch((e) => {
    throw e;
});
//# sourceMappingURL=resetDB.js.map