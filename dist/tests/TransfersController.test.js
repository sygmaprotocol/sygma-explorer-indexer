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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const supertest_1 = __importDefault(require("supertest"));
const path_1 = __importDefault(require("path"));
require('dotenv').config({ path: path_1.default.resolve(__dirname, './.env.test') });
const client_1 = require("@prisma/client");
const app_1 = require("../app");
const mockTxs_1 = require("./mockTxs");
const prisma = new client_1.PrismaClient();
const DEFAULT_TRANSFERS_URL = "/transfers?first=10";
const transferData = {
    depositNonce: 3,
    resourceId: "0x0000000000000000000000000000000000000000000000000000000000000000",
    fromDomainId: 1,
    fromNetworkName: "Local EVM 1",
    toDomainId: 2,
    toNetworkName: "Local EVM 2",
    fromAddress: "0x24962717f8fa5ba3b931bacaf9ac03924eb475a0",
    toAddress: "0x24962717f8fa5ba3b931bacaf9ac03924eb475a0",
    amount: "1000000000000000000",
    timestamp: 1658771219,
    depositTransactionHash: "0xb0d4048dd037e6e46173a7bd5310104c87e81f630cc11b6d028412c2aae98750",
    depositBlockNumber: 583,
    status: 1,
    sourceTokenAddress: "0xda8556c2485048eee3de91085347c3210785323c",
    destinationTokenAddress: "0xda8556c2485048eee3de91085347c3210785323c",
    handlerResponse: null,
    proposalExecutionEvent: {
        originDomainID: 1,
        depositNonce: 3,
        dataHash: "0x5ef98301782da0d86bea1c3dd38d7008f61ecc067f70329d59b7293286fece9d",
        by: "0x148FfB2074A9e59eD58142822b3eB3fcBffb0cd7",
    },
    failedHandlerExecutionEvent: null,
};
describe("Test TransfersController", () => {
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield prisma.transfer.deleteMany({});
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield prisma.$disconnect();
    }));
    describe("with proposalEvents and voteEvents", () => {
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            yield prisma.transfer.create({
                data: transferData,
            });
            console.log("✨ 1 transfer successfully created!");
        }));
        it("Request /transfers should return one transfer with proposalExecution event", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield (0, supertest_1.default)(app_1.app).get(DEFAULT_TRANSFERS_URL).send();
            expect(result.status).toBe(200);
            expect(result.body.transfers[0]).toMatchObject({
                depositNonce: 3,
                resourceId: "0x0000000000000000000000000000000000000000000000000000000000000000",
                fromDomainId: 1,
                fromNetworkName: "Local EVM 1",
                toDomainId: 2,
                toNetworkName: "Local EVM 2",
                fromAddress: "0x24962717f8fa5ba3b931bacaf9ac03924eb475a0",
                toAddress: "0x24962717f8fa5ba3b931bacaf9ac03924eb475a0",
                amount: "1000000000000000000",
                timestamp: 1658771219,
                depositTransactionHash: "0xb0d4048dd037e6e46173a7bd5310104c87e81f630cc11b6d028412c2aae98750",
                depositBlockNumber: 583,
                status: 1,
                sourceTokenAddress: "0xda8556c2485048eee3de91085347c3210785323c",
                destinationTokenAddress: "0xda8556c2485048eee3de91085347c3210785323c",
                handlerResponse: null,
                proposalExecutionEvent: {
                    originDomainID: 1,
                    depositNonce: 3,
                    dataHash: "0x5ef98301782da0d86bea1c3dd38d7008f61ecc067f70329d59b7293286fece9d",
                    by: "0x148FfB2074A9e59eD58142822b3eB3fcBffb0cd7",
                },
                failedHandlerExecutionEvent: null,
            });
        }));
    });
    describe("NO proposalExecution Events ", () => {
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            const alteredTransferData = Object.assign(Object.assign({}, transferData), { status: 0, proposalExecutionEvent: null, failedHandlerExecutionEvent: null });
            yield prisma.transfer.create({
                data: alteredTransferData,
            });
            console.log("✨ 1 transfer successfully created!");
        }));
        it("Request /transfers should return one transfer with NO proposalExecution", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield (0, supertest_1.default)(app_1.app).get(DEFAULT_TRANSFERS_URL).send();
            expect(result.status).toBe(200);
            expect(result.body.transfers[0]).toMatchObject({
                depositNonce: 3,
                resourceId: "0x0000000000000000000000000000000000000000000000000000000000000000",
                fromDomainId: 1,
                fromNetworkName: "Local EVM 1",
                toDomainId: 2,
                toNetworkName: "Local EVM 2",
                fromAddress: "0x24962717f8fa5ba3b931bacaf9ac03924eb475a0",
                toAddress: "0x24962717f8fa5ba3b931bacaf9ac03924eb475a0",
                amount: "1000000000000000000",
                timestamp: 1658771219,
                depositTransactionHash: "0xb0d4048dd037e6e46173a7bd5310104c87e81f630cc11b6d028412c2aae98750",
                depositBlockNumber: 583,
                status: 0,
                sourceTokenAddress: "0xda8556c2485048eee3de91085347c3210785323c",
                destinationTokenAddress: "0xda8556c2485048eee3de91085347c3210785323c",
                handlerResponse: null,
                proposalExecutionEvent: null,
                failedHandlerExecutionEvent: null,
            });
        }));
    });
    describe("with failedHandlerExecution event", () => {
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            const alteredTransferData = Object.assign(Object.assign({}, transferData), { proposalExecutionEvent: null, failedHandlerExecutionEvent: {
                    lowLevelData: '0x0000000000000000000000000000000000000000000000000000000000000000',
                    originDomainID: 1,
                    depositNonce: 3,
                    by: '0x148FfB2074A9e59eD58142822b3eB3fcBffb0cd7'
                } });
            yield prisma.transfer.create({
                data: alteredTransferData,
            });
            console.log("✨ 1 transfer successfully created!");
        }));
        it("Request /transfers should return one transfer with failedHandlerExecution event", () => __awaiter(void 0, void 0, void 0, function* () {
            // await prisma.proposalEvent.deleteMany({})
            const result = yield (0, supertest_1.default)(app_1.app).get(DEFAULT_TRANSFERS_URL).send();
            expect(result.status).toBe(200);
            expect(result.body.transfers[0]).toMatchObject({
                depositNonce: 3,
                resourceId: "0x0000000000000000000000000000000000000000000000000000000000000000",
                fromDomainId: 1,
                fromNetworkName: "Local EVM 1",
                toDomainId: 2,
                toNetworkName: "Local EVM 2",
                fromAddress: "0x24962717f8fa5ba3b931bacaf9ac03924eb475a0",
                toAddress: "0x24962717f8fa5ba3b931bacaf9ac03924eb475a0",
                amount: "1000000000000000000",
                timestamp: 1658771219,
                depositTransactionHash: "0xb0d4048dd037e6e46173a7bd5310104c87e81f630cc11b6d028412c2aae98750",
                depositBlockNumber: 583,
                status: 1,
                sourceTokenAddress: "0xda8556c2485048eee3de91085347c3210785323c",
                destinationTokenAddress: "0xda8556c2485048eee3de91085347c3210785323c",
                handlerResponse: null,
                proposalExecutionEvent: null,
                failedHandlerExecutionEvent: {
                    lowLevelData: '0x0000000000000000000000000000000000000000000000000000000000000000',
                    originDomainID: 1,
                    depositNonce: 3,
                    by: '0x148FfB2074A9e59eD58142822b3eB3fcBffb0cd7'
                }
            });
        }));
    });
    describe('filter over transfers', () => {
        const first = 10;
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            var _a, e_1, _b, _c;
            const { transfers } = mockTxs_1.mockTransfers;
            try {
                for (var _d = true, transfers_1 = __asyncValues(transfers), transfers_1_1; transfers_1_1 = yield transfers_1.next(), _a = transfers_1_1.done, !_a;) {
                    _c = transfers_1_1.value;
                    _d = false;
                    try {
                        const tx = _c;
                        yield prisma.transfer.create({
                            data: tx
                        });
                    }
                    finally {
                        _d = true;
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = transfers_1.return)) yield _b.call(transfers_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            console.log("✨ 20 transfer successfully created!");
        }));
        it('Request /transfers/filters?first=10&fromDomainId=[number]', () => __awaiter(void 0, void 0, void 0, function* () {
            const domainIDFrom = 1;
            const result = yield (0, supertest_1.default)(app_1.app).get(`/transfers/filters?first=${first}&fromDomainId=${domainIDFrom}`).send();
            const onlyDomainIdRequested = result.body.transfers.every((tx) => tx.fromDomainId === domainIDFrom);
            expect(onlyDomainIdRequested).toBe(true);
        }));
        it('Request /transfers/filters?first=10&toDomainId=[number]', () => __awaiter(void 0, void 0, void 0, function* () {
            const domainIDTo = 1;
            const result = yield (0, supertest_1.default)(app_1.app).get(`/transfers/filters?first=${first}&toDomainId=${domainIDTo}`).send();
            const onlyDomainIDTo = result.body.transfers.every((tx) => tx.toDomainId === domainIDTo);
            expect(onlyDomainIDTo).toBe(true);
        }));
        it('Request /transfers/filters?first=10&fromAddress=[string]&toAddress=[string]', () => __awaiter(void 0, void 0, void 0, function* () {
            const fromAddress = '0x5EfB75040BC6257EcE792D8dEd423063E6588A37';
            const toAddress = '0x5EfB75040BC6257EcE792D8dEd423063E6588A37';
            const result = yield (0, supertest_1.default)(app_1.app).get(`/transfers/filters?first=${first}&fromAddress=${fromAddress}&toAddress=${toAddress}`).send();
            expect(result.body.transfers.length).toBeGreaterThan(0);
            const onlyFromAddress = result.body.transfers.every((tx) => tx.fromAddress === fromAddress);
            expect(onlyFromAddress).toBe(true);
        }));
        it('Request /transfers/filters?first=10&depositTransactionHas=[string]', () => __awaiter(void 0, void 0, void 0, function* () {
            const depositTxHash = '0xea5c6f72130cd36c64362facac8e8e7a60fb72c4092890de31a04b442c01d753';
            const result = yield (0, supertest_1.default)(app_1.app).get(`/transfers/filters?first=${first}&depositTransactionHash=${depositTxHash}`).send();
            expect(result.body.transfers.length).toBe(1);
        }));
        it('Request /transfers/filters?after=[string]&first=10&fromAddress=[string]&toAddress=[string]', () => __awaiter(void 0, void 0, void 0, function* () {
            const fromAddress = "0x5EfB75040BC6257EcE792D8dEd423063E6588A37";
            const toAddress = "0x5EfB75040BC6257EcE792D8dEd423063E6588A37";
            const firstResult = yield (0, supertest_1.default)(app_1.app).get(`/transfers/filters?first=5&fromAddress=${fromAddress}&toAddress=${toAddress}`).send();
            const { body: { pageInfo: { endCursor }, transfers: t1 } } = firstResult;
            const onlyFromAddressFirst = t1.every((tx) => tx.fromAddress === fromAddress);
            const secondResult = yield (0, supertest_1.default)(app_1.app).get(`/transfers/filters?after=${endCursor}&first=5&fromAddress=${fromAddress}&toAddress=${toAddress}`).send();
            const { body: { transfers: t2 } } = secondResult;
            const onylFromAddressSecond = t2.every((tx) => tx.fromAddress === fromAddress);
            const lastResult = yield (0, supertest_1.default)(app_1.app).get(`/transfers/filters?first=10&fromAddress=${fromAddress}&toAddress=${toAddress}`);
            const { body: { transfers: t3 } } = lastResult;
            const transferToCompare = [...t1.map((tx) => tx.id), ...t2.map((tx) => tx.id)];
            const allTransfers = t3.map((tx) => tx.id);
            expect(onlyFromAddressFirst).toBe(true);
            expect(onylFromAddressSecond).toBe(true);
            expect(allTransfers).toEqual(transferToCompare);
        }));
        it('Request /transfers/filters?before=[string]&first=10&fromAddress=[string]&toAddress=[string] - check forward and backwards navigation', () => __awaiter(void 0, void 0, void 0, function* () {
            const fromAddress = "0x42Da3Ba8c586F6fe9eF6ed1d09423eB73E4fe25b";
            const toAddress = "0x42Da3Ba8c586F6fe9eF6ed1d09423eB73E4fe25b";
            const firstResult = yield (0, supertest_1.default)(app_1.app).get(`/transfers/filters?first=${first}&fromAddress=${fromAddress}&toAddress=${toAddress}`).send();
            const { body: { pageInfo: { endCursor }, transfers: t1 } } = firstResult;
            const onylFromAddressFirst = t1.every((tx) => tx.fromAddress === fromAddress);
            const secondResult = yield (0, supertest_1.default)(app_1.app).get(`/transfers/filters?after=${endCursor}&first=${first}&fromAddress=${fromAddress}&toAddress=${toAddress}`).send();
            const { body: { pageInfo: { startCursor }, transfers: t2 } } = secondResult;
            const onlyFromAddressSecond = t2.every((tx) => tx.fromAddress === fromAddress);
            const thirdResult = yield (0, supertest_1.default)(app_1.app).get(`/transfers/filters?before=${startCursor}&first=${first}&fromAddress=${fromAddress}&toAddress=${toAddress}`).send();
            const { body: { transfers: t3 } } = thirdResult;
            expect(onylFromAddressFirst).toBe(true);
            expect(onlyFromAddressSecond).toBe(true);
            expect(t1.map((tx) => tx.id)).toEqual(t3.map((tx) => tx.id));
        }));
        it('Request /transfers/filters?after=[string]&first=10&fromAddres=[string] - returns empty array because there is no more data', () => __awaiter(void 0, void 0, void 0, function* () {
            const fromAddress = "0xff93B45308FD417dF303D6515aB04D9e89a750Ca";
            const toAddress = "0xff93B45308FD417dF303D6515aB04D9e89a750Ca";
            const firstResult = yield (0, supertest_1.default)(app_1.app).get(`/transfers/filters?first=${first}&fromAddress=${fromAddress}&toAddress=${toAddress}`).send();
            const { body: { pageInfo: { endCursor } } } = firstResult;
            const secondResult = yield (0, supertest_1.default)(app_1.app).get(`/transfers/filters?first=${first}&fromAddress=${fromAddress}&toAddress=${toAddress}&after=${endCursor}`).send();
            const { body: { transfers, pageInfo: { hasNextPage } } } = secondResult;
            expect(transfers.length).toBe(0);
            expect(hasNextPage).toBe(false);
        }));
        it('Request /transfers/filters?first=10&fromAddress=[string]&toAddress=[string] with the same address but different cases', () => __awaiter(void 0, void 0, void 0, function* () {
            const fromAddress = "0x5EfB75040BC6257EcE792D8dEd423063E6588A37";
            const toAddress = "0x5efb75040bc6257ece792d8ded423063e6588a37";
            const result = yield (0, supertest_1.default)(app_1.app).get(`/transfers/filters?first=${first}&fromAddress=${fromAddress}&toAddress=${toAddress}`).send();
            const { body: { transfers } } = result;
            const everyFromAddress = transfers.every((tx) => tx.fromAddress.toLowerCase() === fromAddress.toLowerCase());
            const everyToAddress = transfers.every((tx) => tx.toAddress.toLowerCase() === toAddress.toLowerCase());
            expect(everyFromAddress).toBe(true);
            expect(everyToAddress).toBe(true);
        }));
        it('Request /transfers/filters?first=10&before=[string]', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield (0, supertest_1.default)(app_1.app).get(`/transfers/filters?first=20`).send();
            const { body: { transfers: t1 } } = result;
            const { id } = t1[10];
            const result2 = yield (0, supertest_1.default)(app_1.app).get(`/transfers/filters?first=${first}&before=${id}`).send();
            const { body: { transfers: t2 } } = result2;
            const indexOfId = t1.findIndex((tx) => tx.id === id);
            const sliced = t1.slice(0, indexOfId).map((tx) => tx.id);
            const filteredResult = t2.map((tx) => tx.id);
            expect(filteredResult).toEqual(sliced);
        }));
        it('Request /transfers/filters?last=10&before=[string]', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield (0, supertest_1.default)(app_1.app).get(`/transfers/filters?last=${20}`).send();
            const { body: { transfers } } = result;
            const { id } = transfers[transfers.length - 1];
            const result2 = yield (0, supertest_1.default)(app_1.app).get(`/transfers/filters?last=${10}&before=${id}`).send();
            const { body: { transfers: t2 } } = result2;
            const sliced = transfers.slice(9, transfers.length - 1).map((tx) => tx.id);
            expect(t2.map((tx) => tx.id)).toEqual(sliced);
        }));
        it('Request /transfers/filters?last=10&before=[string]&fromAddress=[string]&toAddress=[string]', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield (0, supertest_1.default)(app_1.app).get(`/transfers/filters?last=20`).send();
            const { body: { transfers } } = result;
            const { id } = transfers[transfers.length - 1];
            const fromAddress = "0x42Da3Ba8c586F6fe9eF6ed1d09423eB73E4fe25b";
            const toAddress = "0x42da3ba8c586f6fe9ef6ed1d09423eb73e4fe25b";
            const result2 = yield (0, supertest_1.default)(app_1.app).get(`/transfers/filters?last=10&before=${id}&fromAddress=${fromAddress}&toAddress=${toAddress}`).send();
            const { body: { transfers: t2 } } = result2;
            const sliced = transfers.filter((tx) => tx.fromAddress === fromAddress && tx.toAddress === toAddress && tx.id !== id).map((t) => t.id);
            expect(t2.map((tx) => tx.id)).toEqual(sliced);
        }));
    });
});
//# sourceMappingURL=TransfersController.test.js.map