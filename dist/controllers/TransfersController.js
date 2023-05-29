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
exports.TransfersController = void 0;
const transfers_service_1 = __importDefault(require("../services/transfers.service"));
const helpers_1 = require("../utils/helpers");
const transfersService = new transfers_service_1.default();
exports.TransfersController = {
    transfers: function (request, reply) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { query: { before, first, after, last } } = request;
                const params = (0, helpers_1.getPaginationParams)({ before, first, after, last });
                const transfersResult = yield transfersService.findTransfersByCursor(Object.assign({}, params));
                reply.status(200).send(transfersResult);
            }
            catch (e) {
                reply.status(400).send(e);
            }
        });
    },
    transferById: function (request, reply) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = request.params;
            try {
                const transfer = yield transfersService.findTransfer({ id });
                reply.status(200).send(transfer);
            }
            catch (e) {
                reply.status(404);
            }
        });
    }
};
//# sourceMappingURL=TransfersController.js.map