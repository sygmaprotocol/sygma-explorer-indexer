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
exports.seeder = void 0;
const client_1 = require("@prisma/client");
const getSygmaConfig_1 = require("../utils/getSygmaConfig");
const ethers_1 = require("ethers");
const chainbridge_contracts_1 = require("@chainsafe/chainbridge-contracts");
const prismaClient = new client_1.PrismaClient();
const decodeAmountsOrTokenId = (data, decimals, type) => {
    if (type === 'erc20') {
        const amount = ethers_1.ethers.utils.defaultAbiCoder.decode(['uint256'], data)[0];
        return ethers_1.ethers.utils.formatUnits(amount, decimals);
    }
    else {
        const tokenId = ethers_1.ethers.utils.defaultAbiCoder.decode(['uint256'], data)[0];
        return tokenId.toString();
    }
};
const seeder = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    console.log('Start seeding ...');
    try {
        yield prismaClient.$connect();
    }
    catch (e) {
        console.log("Error on connecting to database", e);
    }
    const domains = yield (0, getSygmaConfig_1.getSygmaConfig)();
    const firstDomain = domains[0];
    const { rpcUrl } = firstDomain;
    const provider = new ethers_1.ethers.providers.JsonRpcProvider(rpcUrl);
    const bridge = chainbridge_contracts_1.Bridge__factory.connect(firstDomain.bridge, provider);
    const depositFilter = bridge.filters.Deposit(null, null, null, null, null, null);
    const depositLogs = yield provider.getLogs(Object.assign(Object.assign({}, depositFilter), { fromBlock: firstDomain.startBlock, toBlock: "latest" }));
    const parsedLogs = depositLogs.map((log) => ({ parsedData: bridge.interface.parseLog(log), txHash: log.transactionHash, blockNumber: log.blockNumber }));
    // Avoiding generic transfers
    const filteredResource = '0x0000000000000000000000000000000000000000000000000000000000000500';
    const onlyTokensTransfers = parsedLogs.filter((log) => {
        const { resourceID } = log.parsedData.args;
        const resourceIDAndType = firstDomain.resources.find((resource) => resource.resourceId === resourceID);
        return (resourceIDAndType === null || resourceIDAndType === void 0 ? void 0 : resourceIDAndType.resourceId) === resourceID && (resourceIDAndType === null || resourceIDAndType === void 0 ? void 0 : resourceIDAndType.resourceId) !== filteredResource;
    });
    const amountOfTokenTransfers = onlyTokensTransfers.length;
    for (const pl of onlyTokensTransfers) {
        const { destinationDomainID, resourceID, depositNonce, user, data, handlerResponse } = pl.parsedData.args;
        const { txHash, blockNumber } = pl;
        const destinationDomain = domains.find((domain) => domain.id === destinationDomainID);
        const resourceIDAndType = firstDomain.resources.map((resource) => ({ resourceId: resource.resourceId, type: resource.type, tokenAddress: resource.address, tokenSymbol: resource.symbol }));
        const transferType = (_a = resourceIDAndType.find((resource) => resource.resourceId === resourceID)) === null || _a === void 0 ? void 0 : _a.type;
        const tokenData = resourceIDAndType.find((resource) => resource.resourceId === resourceID);
        const amountOrTokenId = decodeAmountsOrTokenId(data, 18, transferType);
        const arrayifyData = ethers_1.ethers.utils.arrayify(data);
        let filtered;
        const transferStatus = ['pending', 'executed', 'failed'][Math.floor(Math.random() * 3)];
        filtered = arrayifyData.filter((_, idx) => idx + 1 > 65);
        const hexAddress = ethers_1.ethers.utils.hexlify(filtered);
        const transferData = {
            depositNonce: depositNonce.toNumber(),
            type: transferType,
            sender: user,
            amount: amountOrTokenId,
            destination: hexAddress,
            status: transferStatus,
            resource: {
                type: transferType,
                resourceId: resourceID,
            },
            fromDomain: {
                name: firstDomain.name,
                lastIndexedBlock: firstDomain.startBlock.toString(),
                domainId: `${firstDomain.id}`
            },
            toDomain: {
                name: destinationDomain === null || destinationDomain === void 0 ? void 0 : destinationDomain.name,
                lastIndexedBlock: destinationDomain === null || destinationDomain === void 0 ? void 0 : destinationDomain.startBlock.toString(),
                domainId: `${destinationDomain === null || destinationDomain === void 0 ? void 0 : destinationDomain.id}`
            }
        };
        if (transferStatus === 'pending') {
            try {
                yield prismaClient.transfer.create({
                    data: {
                        depositNonce: transferData.depositNonce,
                        type: transferData.type,
                        sender: transferData.sender,
                        amount: transferData.amount,
                        destination: transferData.destination,
                        status: transferData.status,
                        resource: {
                            create: {
                                type: transferData.resource.type,
                                resourceId: transferData.resource.resourceId,
                            }
                        },
                        fromDomain: {
                            create: {
                                name: transferData.fromDomain.name,
                                lastIndexedBlock: transferData.fromDomain.lastIndexedBlock,
                                domainId: transferData.fromDomain.domainId,
                            }
                        },
                        toDomain: {
                            create: {
                                name: transferData.toDomain.name,
                                lastIndexedBlock: transferData.toDomain.lastIndexedBlock,
                                domainId: transferData.toDomain.domainId,
                            }
                        },
                        timestamp: Date.now()
                    },
                });
            }
            catch (e) {
                console.log("Error on creating transfer", e);
            }
        }
        else {
            let augmentedTransfer = Object.assign(Object.assign({}, transferData), { fee: {
                    amount: amountOrTokenId,
                    tokenAddress: tokenData === null || tokenData === void 0 ? void 0 : tokenData.tokenAddress,
                    tokenSymbol: tokenData === null || tokenData === void 0 ? void 0 : tokenData.tokenSymbol,
                }, deposit: {
                    txHash,
                    blockNumber,
                    depositData: data,
                    handlerResponse
                }, execution: {
                    txHash,
                    blockNumber,
                    handlerResponse,
                } });
            try {
                yield prismaClient.transfer.create({
                    data: {
                        depositNonce: transferData.depositNonce,
                        type: transferData.type,
                        sender: transferData.sender,
                        amount: transferData.amount,
                        destination: transferData.destination,
                        status: transferData.status,
                        resource: {
                            create: {
                                type: transferData.resource.type,
                                resourceId: transferData.resource.resourceId,
                            }
                        },
                        fromDomain: {
                            create: {
                                name: transferData.fromDomain.name,
                                lastIndexedBlock: transferData.fromDomain.lastIndexedBlock,
                                domainId: transferData.fromDomain.domainId,
                            }
                        },
                        toDomain: {
                            create: {
                                name: transferData.toDomain.name,
                                lastIndexedBlock: transferData.toDomain.lastIndexedBlock,
                                domainId: transferData.toDomain.domainId,
                            }
                        },
                        fee: {
                            create: {
                                amount: augmentedTransfer.fee.amount,
                                tokenAddress: augmentedTransfer.fee.tokenAddress,
                                tokenSymbol: augmentedTransfer.fee.tokenSymbol,
                            }
                        },
                        deposit: {
                            create: {
                                txHash: augmentedTransfer.deposit.txHash,
                                blockNumber: `${augmentedTransfer.deposit.blockNumber}`,
                                depositData: augmentedTransfer.deposit.depositData,
                                handlerResponse: augmentedTransfer.deposit.handlerResponse,
                            }
                        },
                        execution: {
                            create: {
                                txHash: augmentedTransfer.execution.txHash,
                                blockNumber: `${augmentedTransfer.execution.blockNumber}`,
                                handlerResponse: augmentedTransfer.execution.handlerResponse,
                            }
                        },
                        timestamp: Date.now()
                    },
                });
            }
            catch (e) {
                console.log("Error on creating transfer", e);
            }
        }
    }
    console.log(`Finished seeding, ${amountOfTokenTransfers} transfers created`);
});
exports.seeder = seeder;
//# sourceMappingURL=seeder.js.map