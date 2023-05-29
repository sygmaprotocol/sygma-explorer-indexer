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
exports.indexer = void 0;
//@ts-nocheck
const chainbridge_contracts_1 = require("@chainsafe/chainbridge-contracts");
const helpers_1 = require("../utils/helpers");
const pollFailedHandlerExecutions_1 = require("./pollFailedHandlerExecutions");
const pollProposals_1 = require("./pollProposals");
const pollDeposits_1 = require("./pollDeposits");
function indexer(bridge, config) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`Checking events for ${bridge.name}`);
        const provider = (0, helpers_1.getProvider)(bridge);
        yield provider.ready;
        const bridgeContract = chainbridge_contracts_1.Bridge__factory.connect(bridge.bridgeAddress, provider);
        const erc20HandlerContract = chainbridge_contracts_1.ERC20Handler__factory.connect(bridge.erc20HandlerAddress, provider);
        // TRANSFERS
        yield (0, pollDeposits_1.pollDeposits)(bridge, bridgeContract, erc20HandlerContract, provider, config);
        // PROPOSALS
        yield (0, pollProposals_1.pollProposals)(bridge, bridgeContract, provider, config);
        // Failed Handler Executions
        yield (0, pollFailedHandlerExecutions_1.pollFailedHandlerExecutions)(bridge, bridgeContract, provider, config);
        console.log("finish index");
    });
}
exports.indexer = indexer;
//# sourceMappingURL=indexer.js.map