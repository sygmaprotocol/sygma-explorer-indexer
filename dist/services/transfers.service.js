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
function isForwardPagination(args) {
    return "first" in args && args.first !== undefined;
}
function isBackwardPagination(args) {
    return "last" in args && args.last !== undefined;
}
class TransfersService {
    constructor() {
        this.transfers = new client_1.PrismaClient().transfer;
    }
    findTransfer({ id }) {
        return __awaiter(this, void 0, void 0, function* () {
            const transfer = yield this.transfers.findUnique({
                where: { id }
            });
            if (transfer) {
                return this.addLatestStatusToTransfer(transfer);
            }
            else {
                throw new Error('No transfer found');
            }
        });
    }
    findAllTransfes({ limit, skipIndex }) {
        return __awaiter(this, void 0, void 0, function* () {
            const transfers = yield this.transfers.findMany({
                take: limit,
                skip: skipIndex,
                orderBy: [
                    {
                        timestamp: "desc",
                    },
                ],
                include: {
                    proposalEvents: true,
                    voteEvents: true,
                },
            });
            return this.addLatestStatusToTransfers(transfers);
        });
    }
    buildQueryObject(args) {
        const { filters } = args;
        const where = {
            fromDomainId: undefined,
            fromAddress: undefined,
            toAddress: undefined,
            depositTransactionHash: undefined,
            toDomainId: undefined,
            OR: undefined
        };
        if (filters !== undefined && Object.keys(filters).length) {
            const { fromAddress, toAddress, depositTransactionHash, fromDomainId, toDomainId } = filters;
            where.OR = fromAddress && toAddress && [
                {
                    fromAddress: { equals: fromAddress, mode: "insensitive" },
                },
                {
                    toAddress: { equals: toAddress, mode: "insensitive" },
                },
            ];
            where.fromDomainId = fromDomainId && parseInt(fromDomainId, 10);
            where.depositTransactionHash = depositTransactionHash;
            where.toDomainId = toDomainId && parseInt(toDomainId, 10);
        }
        return {
            orderBy: { timestamp: "desc" },
            where
        };
    }
    findTransfersByCursor(args) {
        return __awaiter(this, void 0, void 0, function* () {
            let rawTransfers;
            let hasPreviousPage;
            let hasNextPage;
            if (isForwardPagination(args)) {
                const cursor = args.after ? { id: args.after } : undefined;
                const skip = args.after ? 1 : undefined;
                const take = args.first + 1;
                const { orderBy, where } = this.buildQueryObject(args);
                rawTransfers = yield this.transfers.findMany({
                    cursor,
                    take,
                    skip,
                    orderBy,
                    where
                });
                // See if we are "after" another record, indicating a previous page
                hasPreviousPage = !!args.after;
                // See if we have an additional record, indicating a next page
                hasNextPage = rawTransfers.length > args.first;
                // Remove the extra record (last element) from the results
                if (hasNextPage)
                    rawTransfers.pop();
            }
            else if (isBackwardPagination(args)) {
                const take = -1 * (args.last + 1);
                const cursor = args.before ? { id: args.before } : undefined;
                const skip = cursor ? 1 : undefined;
                const { orderBy, where } = this.buildQueryObject(args);
                rawTransfers = yield this.transfers.findMany({
                    cursor,
                    take,
                    skip,
                    orderBy,
                    where
                });
                hasNextPage = !!args.before;
                hasPreviousPage = rawTransfers.length > args.last;
                if (hasPreviousPage)
                    rawTransfers.shift();
            }
            let transfers = [];
            let startCursor = "";
            let endCursor = "";
            if (rawTransfers.length) {
                transfers = this.addLatestStatusToTransfers(rawTransfers);
                startCursor = transfers[0].id;
                endCursor = transfers[transfers.length - 1].id;
            }
            return {
                transfers,
                pageInfo: {
                    hasPreviousPage,
                    hasNextPage,
                    startCursor,
                    endCursor,
                },
            };
        });
    }
    addLatestStatusToTransfers(transfers) {
        return transfers.map(transfer => this.addLatestStatusToTransfer(transfer));
    }
    addLatestStatusToTransfer(transfer) {
        if (transfer.proposalExecutionEvent) {
            transfer.status = 1;
        }
        return transfer;
    }
}
exports.default = TransfersService;
//# sourceMappingURL=transfers.service.js.map