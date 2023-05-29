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
exports.saveProposals = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function saveProposals(bridge, bridgeContract, provider, config) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const proposalEventFilter = bridgeContract.filters.ProposalExecution(null, null, null);
        const proposalEventLogs = yield provider.getLogs(Object.assign(Object.assign({}, proposalEventFilter), { fromBlock: bridge.deployedBlockNumber, toBlock: (_a = bridge.latestBlockNumber) !== null && _a !== void 0 ? _a : "latest" }));
        for (const pel of proposalEventLogs) {
            let depositNonceInt;
            try {
                const tx = yield provider.getTransaction(pel.transactionHash);
                const { from: transactionSenderAddress } = tx;
                const parsedLog = bridgeContract.interface.parseLog(pel);
                const { depositNonce, originDomainID, dataHash } = parsedLog.args;
                depositNonceInt = depositNonce.toNumber();
                yield prisma.transfer.update({
                    where: {
                        depositNonce: depositNonceInt,
                    },
                    data: {
                        proposalExecutionEvent: {
                            set: {
                                originDomainID: originDomainID,
                                depositNonce: depositNonceInt,
                                dataHash: dataHash,
                                by: transactionSenderAddress
                            },
                        },
                    },
                });
            }
            catch (error) {
                console.error(error);
                console.error("DepositNonce", depositNonceInt);
            }
        }
        console.log(`Added ${bridge.name} \x1b[33m${proposalEventLogs.length}\x1b[0m proposal events`);
    });
}
exports.saveProposals = saveProposals;
//# sourceMappingURL=saveProposals.js.map