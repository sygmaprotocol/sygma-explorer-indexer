"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatConfig = exports.getHandlersMap = exports.getPaginationParams = exports.decodeDataHash = exports.getNetworkName = exports.jsonStringifyWithBigInt = exports.getProvider = void 0;
const celo_ethers_wrapper_1 = require("@celo-tools/celo-ethers-wrapper");
const ethers_1 = require("ethers");
const devnet_json_1 = __importDefault(require("../rpcUrlMappings/devnet.json"));
const testnet_json_1 = __importDefault(require("../rpcUrlMappings/testnet.json"));
const local_json_1 = __importDefault(require("../rpcUrlMappings/local.json"));
const chainbridge_contracts_1 = require("@chainsafe/chainbridge-contracts");
const isCelo = (networkId) => [42220, 44787, 62320].includes(networkId !== null && networkId !== void 0 ? networkId : 0);
const getRpcProviderFromHttpUrl = (url) => {
    const urlInstance = new URL(url);
    if (urlInstance.username && urlInstance.password) {
        const urlInfo = {
            url: urlInstance.hostname,
            user: urlInstance.username,
            password: urlInstance.password,
        };
        return new ethers_1.ethers.providers.JsonRpcProvider(urlInfo);
    }
    return new ethers_1.ethers.providers.JsonRpcProvider(url);
};
const getRpcProviderFromWebsocket = (destinationChainConfig) => {
    const { rpcUrl, networkId } = destinationChainConfig;
    if (rpcUrl.includes("infura")) {
        const parts = rpcUrl.split("/");
        return new ethers_1.ethers.providers.InfuraWebSocketProvider(networkId, parts[parts.length - 1]);
    }
    else if (rpcUrl.includes("alchemyapi")) {
        const parts = rpcUrl.split("/");
        return new ethers_1.ethers.providers.AlchemyWebSocketProvider(networkId, parts[parts.length - 1]);
    }
    else {
        return new ethers_1.ethers.providers.WebSocketProvider(rpcUrl, networkId);
    }
};
function getProvider(destinationChainConfig) {
    if (isCelo(destinationChainConfig.networkId)) {
        return new celo_ethers_wrapper_1.CeloProvider(destinationChainConfig.rpcUrl);
    }
    else if (destinationChainConfig.rpcUrl.startsWith("wss")) {
        return getRpcProviderFromWebsocket(destinationChainConfig);
    }
    else {
        return getRpcProviderFromHttpUrl(destinationChainConfig === null || destinationChainConfig === void 0 ? void 0 : destinationChainConfig.rpcUrl);
    }
}
exports.getProvider = getProvider;
function jsonStringifyWithBigInt(value) {
    if (value !== undefined) {
        return JSON.stringify(value, (_, v) => typeof v === "bigint" ? `${v}n` : v);
    }
}
exports.jsonStringifyWithBigInt = jsonStringifyWithBigInt;
function getNetworkName(domainId, sygmaConfig) {
    var _a;
    return (((_a = sygmaConfig.chains.find((c) => c.domainId === domainId)) === null || _a === void 0 ? void 0 : _a.name) || "");
}
exports.getNetworkName = getNetworkName;
function decodeDataHash(data, decimals) {
    const decodedData = ethers_1.ethers.utils.defaultAbiCoder.decode(["uint", "uint"], data);
    const destinationRecipientAddressLen = decodedData[1].toNumber() * 2; // adjusted for bytes
    const result = {
        amount: decodedData[0].toString(),
        destinationRecipientAddress: `0x${data.slice(130, 130 + destinationRecipientAddressLen)}`
    };
    return result;
}
exports.decodeDataHash = decodeDataHash;
function getPaginationParams({ first, last, before, after }) {
    const beforeCursor = before === null || before === void 0 ? void 0 : before.toString();
    const firstCursor = first ? parseInt(first === null || first === void 0 ? void 0 : first.toString()) : undefined;
    const afterCursor = after === null || after === void 0 ? void 0 : after.toString();
    const lastCursor = last ? parseInt(last === null || last === void 0 ? void 0 : last.toString()) : undefined;
    return {
        before: beforeCursor,
        after: afterCursor,
        first: firstCursor,
        last: lastCursor
    };
}
exports.getPaginationParams = getPaginationParams;
function getHandlersMap(bridge, provider) {
    const erc20HandlerContract = chainbridge_contracts_1.ERC20Handler__factory.connect(bridge.erc20HandlerAddress, provider);
    const erc721HandlerContract = chainbridge_contracts_1.ERC721Handler__factory.connect(bridge.erc721HandlerAddress, provider);
    const handlersMap = {};
    handlersMap[bridge.erc20HandlerAddress] = erc20HandlerContract;
    handlersMap[bridge.erc721HandlerAddress] = erc721HandlerContract;
    return handlersMap;
}
exports.getHandlersMap = getHandlersMap;
function formatConfig(config, stage) {
    const mapedRPCUrlPerStage = getRPCUrlMapping(stage);
    const formatedConfig = config.domains.map((domain) => ({
        id: domain.id,
        name: getNetworkNameFromMap(domain.id, mapedRPCUrlPerStage),
        decimals: domain.nativeTokenDecimals,
        nativeTokenSymbol: domain.nativeTokenSymbol.toUpperCase(),
        type: domain.type,
        bridge: domain.bridge,
        feeRouter: domain.feeRouter || "",
        handlers: domain.handlers,
        resources: [
            ...domain.resources.map((resource) => ({
                address: resource.address,
                decimals: resource.decimals,
                resourceId: resource.resourceId,
                type: resource.type,
                symbol: resource.symbol,
            })),
        ],
        blockConfirmations: domain.blockConfirmations,
        feeHandlers: domain.feeHandlers,
        rpcUrl: getRPCUrl(domain.id, mapedRPCUrlPerStage),
        nativeTokenFullName: domain.nativeTokenFullName,
        nativeTokenDecimals: domain.nativeTokenDecimals,
        startBlock: domain.startBlock,
    }));
    return formatedConfig;
}
exports.formatConfig = formatConfig;
const getRPCUrl = (id, mapedDomain) => {
    const domainFound = mapedDomain.find(domain => domain.id === id);
    return (domainFound === null || domainFound === void 0 ? void 0 : domainFound.rpcUrl) || "";
};
const getNetworkNameFromMap = (id, mapedDomain) => {
    const networkFound = mapedDomain.find(domain => domain.id === id);
    return (networkFound === null || networkFound === void 0 ? void 0 : networkFound.name) || "";
};
const getRPCUrlMapping = (stage) => {
    if (stage === "devnet") {
        return devnet_json_1.default;
    }
    else if (stage === "testnet") {
        return testnet_json_1.default;
    }
    else if (stage === 'local') {
        return local_json_1.default;
    }
    else {
        throw new Error("Invalid stage");
    }
};
//# sourceMappingURL=helpers.js.map