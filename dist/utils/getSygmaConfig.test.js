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
const getSygmaConfig_1 = require("./getSygmaConfig");
const devnet_shared_config_1 = __importDefault(require("./mocks/devnet-shared-config"));
const testnet_shared_config_1 = __importDefault(require("./mocks/testnet-shared-config"));
global.fetch = jest.fn();
const { Response } = jest.requireActual('cross-fetch');
describe('getSygmaConfig', () => {
    it('Should return the config for devnet', () => __awaiter(void 0, void 0, void 0, function* () {
        const originalNodeEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'production';
        process.env.STAGE = 'devnet';
        process.env.CONFIG_SERVER_URL = 'some-url';
        fetch.mockResolvedValue(new Response(JSON.stringify(devnet_shared_config_1.default), { status: 200, statusText: 'OK' }));
        const sygmaConfig = yield (0, getSygmaConfig_1.getSygmaConfig)();
        const expectedKeys = [
            'id',
            'name',
            'decimals',
            'nativeTokenSymbol',
            'type',
            'bridge',
            'feeRouter',
            'handlers',
            'resources',
            'blockConfirmations',
            'feeHandlers',
            'rpcUrl',
            'nativeTokenFullName',
            'nativeTokenDecimals',
            'startBlock'
        ];
        const expectedNetworkNamesandDomainIdsForDevnet = [
            { name: "Goerli", domainId: '0' },
            { name: "Mumbai", domainId: '1' },
            { name: "Moonbase Alpha", domainId: '2' },
            { name: "Sepolia", domainId: '3' },
        ];
        const keys = Object.keys(sygmaConfig[0]);
        // Temporary => filtering PHA domain
        const filteredConfig = sygmaConfig.filter(domain => domain.id !== 5);
        keys.forEach(key => {
            const keyFound = expectedKeys.find(expectedKey => expectedKey === key);
            expect(keyFound).toBeTruthy();
        });
        for (let domain of filteredConfig) {
            for (let key in domain) {
                if (key === 'name') {
                    const nameFound = expectedNetworkNamesandDomainIdsForDevnet.find(expectedNetwork => expectedNetwork.name === domain[key]);
                    expect(nameFound === null || nameFound === void 0 ? void 0 : nameFound.name).toBeTruthy();
                }
                if (key === 'domainId') {
                    const domainIdFound = expectedNetworkNamesandDomainIdsForDevnet.find(expectedNetwork => expectedNetwork.domainId === domain[key]);
                    expect(domainIdFound === null || domainIdFound === void 0 ? void 0 : domainIdFound.domainId).toBeTruthy();
                }
            }
        }
        process.env.NODE_ENV = originalNodeEnv;
    }));
    it('Should return the config for testnet', () => __awaiter(void 0, void 0, void 0, function* () {
        const originalNodeEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'production';
        process.env.STAGE = 'testnet';
        process.env.CONFIG_SERVER_URL = 'some-url';
        fetch.mockResolvedValue(new Response(JSON.stringify(testnet_shared_config_1.default), { status: 200, statusText: 'OK' }));
        const sygmaConfig = yield (0, getSygmaConfig_1.getSygmaConfig)();
        const expectedKeys = [
            'id',
            'name',
            'decimals',
            'nativeTokenSymbol',
            'type',
            'bridge',
            'feeRouter',
            'handlers',
            'resources',
            'blockConfirmations',
            'feeHandlers',
            'rpcUrl',
            'nativeTokenFullName',
            'nativeTokenDecimals',
            'startBlock'
        ];
        const expectedNetworkNamesandDomainIdsForDevnet = [
            { name: "Goerli", domainId: '1' },
            { name: "Moonbase Alpha", domainId: '2' },
            { name: "Mumbai", domainId: '3' },
            { name: "Sepolia", domainId: '4' },
        ];
        const keys = Object.keys(sygmaConfig[0]);
        keys.forEach(key => {
            const keyFound = expectedKeys.find(expectedKey => expectedKey === key);
            expect(keyFound).toBeTruthy();
        });
        for (let domain of sygmaConfig) {
            for (let key in domain) {
                if (key === 'name') {
                    const nameFound = expectedNetworkNamesandDomainIdsForDevnet.find(expectedNetwork => expectedNetwork.name === domain[key]);
                    expect(nameFound === null || nameFound === void 0 ? void 0 : nameFound.name).toBeTruthy();
                }
                if (key === 'domainId') {
                    const domainIdFound = expectedNetworkNamesandDomainIdsForDevnet.find(expectedNetwork => expectedNetwork.domainId === domain[key]);
                    expect(domainIdFound === null || domainIdFound === void 0 ? void 0 : domainIdFound.domainId).toBeTruthy();
                }
            }
        }
        process.env.NODE_ENV = originalNodeEnv;
    }));
    it("Should return an error if the config is not fetch", () => __awaiter(void 0, void 0, void 0, function* () {
        const originalNodeEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'production';
        process.env.STAGE = 'devnet';
        process.env.CONFIG_SERVER_URL = 'some-url';
        fetch.mockRejectedValue(new Response(null, { status: 500, statusText: 'Internal Sever Error' }));
        const sygmaConfig = yield (0, getSygmaConfig_1.getSygmaConfig)();
        expect(sygmaConfig.error.message).toBe("Failed to fetch");
        process.env.NODE_ENV = originalNodeEnv;
    }));
});
//# sourceMappingURL=getSygmaConfig.test.js.map