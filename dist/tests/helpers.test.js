"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("../utils/helpers");
const DEFAULT_DECIMALS = 18;
describe('helpers', () => {
    it("decoded datahash", () => {
        const data = "0x0000000000000000000000000000000000000000000000003782dace9d900000000000000000000000000000000000000000000000000000000000000000001442da3ba8c586f6fe9ef6ed1d09423eb73e4fe25b";
        expect((0, helpers_1.decodeDataHash)(data, DEFAULT_DECIMALS)).toMatchObject({
            amount: "4000000000000000000",
            destinationRecipientAddress: "0x42da3ba8c586f6fe9ef6ed1d09423eb73e4fe25b"
        });
    });
});
//# sourceMappingURL=helpers.test.js.map