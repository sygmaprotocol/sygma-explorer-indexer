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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveDeposits = void 0;
const node_cache_1 = __importDefault(require("node-cache"));
const client_1 = require("@prisma/client");
const helpers_1 = require("../utils/helpers");
const getDestinationTokenAddress_1 = require("../utils/getDestinationTokenAddress");
const prisma = new client_1.PrismaClient();
const cache = new node_cache_1.default({ stdTTL: 15 });
function saveDeposits(bridge, bridgeContract, provider, config) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const depositFilter = bridgeContract.filters.Deposit(null, null, null, null, null, null);
        const depositLogs = yield provider.getLogs(Object.assign(Object.assign({}, depositFilter), { fromBlock: bridge.deployedBlockNumber, toBlock: (_a = bridge.latestBlockNumber) !== null && _a !== void 0 ? _a : "latest" }));
        const handlersMap = (0, helpers_1.getHandlersMap)(bridge, provider);
        for (const dl of depositLogs) {
            const parsedLog = bridgeContract.interface.parseLog(dl);
            const { destinationDomainID, resourceID, depositNonce, user, data, handlerResponse } = parsedLog.args;
            const depositNonceInt = depositNonce.toNumber();
            const { destinationRecipientAddress, amount } = (0, helpers_1.decodeDataHash)(data, bridge.decimals);
            console.time(`Nonce: ${depositNonce}`);
            let dataTransfer;
            try {
                let tokenAddress;
                const cacheTokenKey = `resourceIDToTokenContractAddress_${resourceID}_${bridge.domainId}`;
                if (cache.has(cacheTokenKey)) {
                    tokenAddress = cache.get(cacheTokenKey);
                }
                else {
                    const handlerAddress = yield bridgeContract._resourceIDToHandlerAddress(resourceID);
                    tokenAddress = yield handlersMap[handlerAddress]._resourceIDToTokenContractAddress(resourceID);
                    cache.set(cacheTokenKey, tokenAddress);
                }
                let destinationTokenAddress;
                if (cache.has(`${resourceID}-${destinationDomainID}`)) {
                    destinationTokenAddress = cache.get(`${resourceID}-${destinationDomainID}`);
                }
                else {
                    destinationTokenAddress = yield (0, getDestinationTokenAddress_1.getDestinationTokenAddress)(resourceID, destinationDomainID, config);
                    cache.set(`${resourceID}-${destinationDomainID}`, destinationTokenAddress);
                }
                dataTransfer = {
                    depositNonce: depositNonceInt,
                    fromAddress: user.toLocaleLowerCase(),
                    depositBlockNumber: dl.blockNumber,
                    depositTransactionHash: dl.transactionHash,
                    fromDomainId: bridge.domainId,
                    fromNetworkName: bridge.name,
                    timestamp: (yield provider.getBlock(dl.blockNumber)).timestamp,
                    toDomainId: destinationDomainID,
                    toNetworkName: (0, helpers_1.getNetworkName)(destinationDomainID, config),
                    toAddress: destinationRecipientAddress.toLocaleLowerCase(),
                    sourceTokenAddress: tokenAddress.toLocaleLowerCase(),
                    destinationTokenAddress: destinationTokenAddress.toLocaleLowerCase(),
                    amount: amount,
                    resourceId: resourceID,
                    handlerResponse: handlerResponse
                };
                yield prisma.transfer.upsert({
                    where: {
                        depositNonce: depositNonceInt
                    },
                    create: dataTransfer,
                    update: dataTransfer,
                });
            }
            catch (error) {
                console.error(error);
                console.error("DepositNonce", depositNonceInt);
                console.error("dataTransfer", dataTransfer);
            }
            console.timeEnd(`Nonce: ${parsedLog.args.depositNonce}`);
        }
        ;
        console.log(`Added ${bridge.name} \x1b[33m${depositLogs.length}\x1b[0m deposits`);
    });
}
exports.saveDeposits = saveDeposits;
//# sourceMappingURL=saveDeposits.js.map