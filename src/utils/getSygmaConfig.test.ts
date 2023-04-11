import { IndexerSharedConfig } from "types";
import { getSygmaConfig } from "./getSygmaConfig";
import devnetSharedConfig from "./mocks/devnet-shared-config";

global.fetch = jest.fn();

const { Response } = jest.requireActual<typeof import('cross-fetch')>('cross-fetch');

describe('getSygmaConfig', () => {
  it('Should return the config', async () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    process.env.STAGE = 'devnet';
    process.env.CONFIG_SERVER_URL = 'some-url';


    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(
      new Response(JSON.stringify(devnetSharedConfig), { status: 200, statusText: 'OK' }),
    );

    const sygmaConfig = await getSygmaConfig() as IndexerSharedConfig

    const expectedKeys = [
      "domainId",
      "networkId",
      "name",
      "decimals",
      "bridgeAddress",
      "erc20HandlerAddress",
      "erc721HandlerAddress",
      "rpcUrl",
      "type",
      "nativeTokenSymbol",
      "confirmations",
      "tokens",
      "feeRouterAddress",
      "feeHandlers"
    ]

    const keys = Object.keys(sygmaConfig.chains[0])

    keys.forEach(key => {
      const keyFound = expectedKeys.find(expectedKey => expectedKey === key)
      expect(keyFound).toBeTruthy()
    })

    process.env.NODE_ENV = originalNodeEnv;
  });

  it("Should return an error if the config is not fetch", async () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    process.env.STAGE = 'devnet';
    process.env.CONFIG_SERVER_URL = 'some-url';

    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValue(
      new Response(null, { status: 500, statusText: 'Internal Sever Error' }),
    );

    const sygmaConfig = await getSygmaConfig() as { error: { message: string }}
    expect(sygmaConfig.error.message).toBe("Failed to fetch")

    process.env.NODE_ENV = originalNodeEnv;
  });
});