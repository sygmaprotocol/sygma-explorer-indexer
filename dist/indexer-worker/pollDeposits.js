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
exports.pollDeposits = void 0;
const node_cache_1 = __importDefault(require("node-cache"));
const client_1 = require("@prisma/client");
const helpers_1 = require("../utils/helpers");
const getDestinationTokenAddress_1 = require("../utils/getDestinationTokenAddress");
const prisma = new client_1.PrismaClient();
const cache = new node_cache_1.default({ stdTTL: 15 });
function pollDeposits(bridge, bridgeContract, erc20HandlerContract, provider, config) {
    return __awaiter(this, void 0, void 0, function* () {
        const depositFilter = bridgeContract.filters.Deposit(null, null, null);
        bridgeContract.on(depositFilter, (destinationDomainID, resourceID, depositNonce, user, data, handlerResponse, tx) => __awaiter(this, void 0, void 0, function* () {
            let dataTransfer;
            const depositNonceInt = depositNonce.toNumber();
            try {
                const { destinationRecipientAddress, amount } = (0, helpers_1.decodeDataHash)(data, bridge.decimals);
                console.time(`Deposit. Nonce: ${depositNonce}`);
                let tokenAddress;
                const cacheTokenKey = `resourceIDToTokenContractAddress_${resourceID}_${bridge.domainId}`;
                if (cache.has(cacheTokenKey)) {
                    tokenAddress = cache.get(cacheTokenKey);
                }
                else {
                    tokenAddress = yield erc20HandlerContract._resourceIDToTokenContractAddress(resourceID);
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
                    depositBlockNumber: tx.blockNumber,
                    depositTransactionHash: tx.transactionHash,
                    fromDomainId: bridge.domainId,
                    fromNetworkName: bridge.name,
                    timestamp: (yield provider.getBlock(tx.blockNumber)).timestamp,
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
            console.timeEnd(`Deposit. Nonce: ${depositNonce}`);
        }));
        console.log(`Bridge on ${bridge.name} listen for deposits`);
    });
}
exports.pollDeposits = pollDeposits;
//# sourceMappingURL=pollDeposits.js.map