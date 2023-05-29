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
exports.getSygmaConfig = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const helpers_1 = require("./helpers");
if (process.env.STAGE !== 'devnet') {
    dotenv_1.default.config({
        path: `${process.cwd()}/.env.testnet`
    });
}
else {
    dotenv_1.default.config({
        path: `${process.cwd()}/.env.devnet`
    });
}
const getLocalConfig = () => {
    const localConfig = require("../../public/sygma-explorer-shared-config.json");
    return (0, helpers_1.formatConfig)(localConfig, "local");
};
const getSharedConfig = () => __awaiter(void 0, void 0, void 0, function* () {
    const { env: { CONFIG_SERVER_URL, STAGE } } = process;
    try {
        const response = yield fetch(CONFIG_SERVER_URL);
        const data = yield response.json();
        const formatedConfig = (0, helpers_1.formatConfig)(data, STAGE);
        return formatedConfig;
    }
    catch (e) {
        console.error(`Failed to fecth config for ${process.env.STAGE}`, e);
        return Promise.reject(e);
    }
});
function getSygmaConfig() {
    return __awaiter(this, void 0, void 0, function* () {
        let config;
        try {
            if (process.env.NODE_ENV !== 'development') {
                config = yield getSharedConfig();
            }
            else {
                config = yield getLocalConfig();
            }
        }
        catch (e) {
            return { error: { message: "Failed to fetch" } };
        }
        return config;
    });
}
exports.getSygmaConfig = getSygmaConfig;
//# sourceMappingURL=getSygmaConfig.js.map