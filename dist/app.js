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
exports.app = void 0;
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const fastify_healthcheck_1 = __importDefault(require("fastify-healthcheck"));
const routes_1 = require("./routes");
exports.app = (0, fastify_1.default)({ logger: true });
exports.app.register(cors_1.default, {
    origin: "*" // in the meantime
});
exports.app.register(fastify_healthcheck_1.default, {
    healthcheckUrl: "/health",
    exposeUptime: true,
    underPressureOptions: {
        healthCheckInterval: 5000,
        healthCheck: () => __awaiter(void 0, void 0, void 0, function* () {
            return true;
        })
    }
});
exports.app.register(routes_1.routes, { prefix: "/api" });
//# sourceMappingURL=app.js.map