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
exports.getDestinationTokenAddress = void 0;
//@ts-nocheck
const chainbridge_contracts_1 = require("@chainsafe/chainbridge-contracts");
const helpers_1 = require("./helpers");
function getDestinationTokenAddress(resourceID, destinationDomainID, config) {
    return __awaiter(this, void 0, void 0, function* () {
        const bridge = config.chains.find(bridge => bridge.domainId === destinationDomainID);
        const provider = (0, helpers_1.getProvider)(bridge);
        yield provider.ready;
        const handlersMap = (0, helpers_1.getHandlersMap)(bridge, provider);
        const bridgeContract = chainbridge_contracts_1.Bridge__factory.connect(bridge.bridgeAddress, provider);
        const handlerAddress = yield bridgeContract._resourceIDToHandlerAddress(resourceID);
        const tokenAddress = yield handlersMap[handlerAddress]._resourceIDToTokenContractAddress(resourceID);
        return tokenAddress;
    });
}
exports.getDestinationTokenAddress = getDestinationTokenAddress;
//# sourceMappingURL=getDestinationTokenAddress.js.map