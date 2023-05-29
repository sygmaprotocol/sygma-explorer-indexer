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
exports.indexFailedHandlerExecutions = exports.indexProposals = exports.indexDeposits = void 0;
// @ts-nocheck
const chainbridge_contracts_1 = require("@chainsafe/chainbridge-contracts");
const helpers_1 = require("../utils/helpers");
const saveDeposits_1 = require("./saveDeposits");
const saveProposals_1 = require("./saveProposals");
const saveFailedHandlerExecutions_1 = require("./saveFailedHandlerExecutions");
function indexDeposits(bridge, config) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`\nChecking depostis for ${bridge.name}`);
        const provider = (0, helpers_1.getProvider)(bridge);
        yield provider.ready;
        const bridgeContract = chainbridge_contracts_1.Bridge__factory.connect(bridge.bridgeAddress, provider);
        yield (0, saveDeposits_1.saveDeposits)(bridge, bridgeContract, provider, config);
    });
}
exports.indexDeposits = indexDeposits;
function indexProposals(bridge, config) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`\nChecking proposals executions for ${bridge.name}`);
        const provider = (0, helpers_1.getProvider)(bridge);
        yield provider.ready;
        const bridgeContract = chainbridge_contracts_1.Bridge__factory.connect(bridge.bridgeAddress, provider);
        yield (0, saveProposals_1.saveProposals)(bridge, bridgeContract, provider, config);
    });
}
exports.indexProposals = indexProposals;
function indexFailedHandlerExecutions(bridge, config) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`Checking failed handler exectutions for ${bridge.name}`);
        const provider = (0, helpers_1.getProvider)(bridge);
        yield provider.ready;
        const bridgeContract = chainbridge_contracts_1.Bridge__factory.connect(bridge.bridgeAddress, provider);
        yield (0, saveFailedHandlerExecutions_1.saveFailedHandlerExecutions)(bridge, bridgeContract, provider, config);
    });
}
exports.indexFailedHandlerExecutions = indexFailedHandlerExecutions;
//# sourceMappingURL=indexer.js.map