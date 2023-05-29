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
exports.pollProposals = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function pollProposals(bridge, bridgeContract, provider, config) {
    return __awaiter(this, void 0, void 0, function* () {
        const proposalExecutionEventFilter = bridgeContract.filters.ProposalExecution(null, null, null);
        bridgeContract.on(proposalExecutionEventFilter, (originDomainID, depositNonce, dataHash, tx) => __awaiter(this, void 0, void 0, function* () {
            const depositNonceInt = depositNonce.toNumber();
            console.time(`ProposalExecution. Nonce: ${depositNonce}`);
            try {
                const eventTransaction = yield provider.getTransaction(tx.transactionHash);
                const { from: transactionSenderAddress } = eventTransaction;
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
                                by: transactionSenderAddress,
                            },
                        },
                    },
                });
            }
            catch (error) {
                console.error(error);
                console.error("DepositNonce", depositNonceInt);
            }
            console.timeEnd(`ProposalExecution. Nonce: ${depositNonce}`);
        }));
        console.log(`Bridge on ${bridge.name} listen for proposal events`);
    });
}
exports.pollProposals = pollProposals;
//# sourceMappingURL=pollProposals.js.map