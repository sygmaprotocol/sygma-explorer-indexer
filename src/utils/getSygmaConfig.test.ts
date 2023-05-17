import { SharedConfig } from "types";
import { getSygmaConfig } from "./getSygmaConfig";
import devnetSharedConfig from "./mocks/devnet-shared-config";
import testnetSharedConfig from "./mocks/testnet-shared-config";

global.fetch = jest.fn();

const { Response } = jest.requireActual<typeof import('cross-fetch')>('cross-fetch');

describe('getSygmaConfig', () => {
  it('Should return the config for devnet', async () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    process.env.STAGE = 'devnet';
    process.env.CONFIG_SERVER_URL = 'some-url';


    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(
      new Response(JSON.stringify(devnetSharedConfig), { status: 200, statusText: 'OK' }),
    );

    const sygmaConfig = await getSygmaConfig() as SharedConfig[];

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
    ]
    

    const expectedNetworkNamesandDomainIdsForDevnet = [
      { name: "Goerli", domainId: '0' },
      { name: "Mumbai", domainId: '1' },
      { name: "Moonbase Alpha", domainId: '2' },
      { name: "Sepolia", domainId: '3' },
    ]

    const keys = Object.keys(sygmaConfig[0])

    // Temporary => filtering PHA domain
    const filteredConfig = sygmaConfig.filter(domain => domain.id !== 5)

    keys.forEach(key => {
      const keyFound = expectedKeys.find(expectedKey => expectedKey === key)
      expect(keyFound).toBeTruthy()
    })

    for(let domain of filteredConfig) {
      for(let key in domain){
        if(key === 'name') {
          const nameFound = expectedNetworkNamesandDomainIdsForDevnet.find(expectedNetwork => expectedNetwork.name === domain[key as keyof SharedConfig])
          expect(nameFound?.name).toBeTruthy()
        }

        if(key === 'domainId') {
          const domainIdFound = expectedNetworkNamesandDomainIdsForDevnet.find(expectedNetwork => expectedNetwork.domainId === domain[key as keyof SharedConfig])
          expect(domainIdFound?.domainId).toBeTruthy()
        }
      }
    }

    process.env.NODE_ENV = originalNodeEnv;
  });

  it('Should return the config for testnet', async () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    process.env.STAGE = 'testnet';
    process.env.CONFIG_SERVER_URL = 'some-url';


    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(
      new Response(JSON.stringify(testnetSharedConfig), { status: 200, statusText: 'OK' }),
    );

    const sygmaConfig = await getSygmaConfig() as SharedConfig[]

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
    ]

    const expectedNetworkNamesandDomainIdsForDevnet = [
      { name: "Goerli", domainId: '1' },
      { name: "Moonbase Alpha", domainId: '2' },
      { name: "Mumbai", domainId: '3' },
      { name: "Sepolia", domainId: '4' },
    ]

    const keys = Object.keys(sygmaConfig[0])

    keys.forEach(key => {
      const keyFound = expectedKeys.find(expectedKey => expectedKey === key)
      expect(keyFound).toBeTruthy()
    })

    for(let domain of sygmaConfig) {
      for(let key in domain){
        if(key === 'name') {
          const nameFound = expectedNetworkNamesandDomainIdsForDevnet.find(expectedNetwork => expectedNetwork.name === domain[key as keyof SharedConfig])
          expect(nameFound?.name).toBeTruthy()
        }

        if(key === 'domainId') {
          const domainIdFound = expectedNetworkNamesandDomainIdsForDevnet.find(expectedNetwork => expectedNetwork.domainId === domain[key as keyof SharedConfig])
          expect(domainIdFound?.domainId).toBeTruthy()
        }
      }
    }

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

    try {
      await getSygmaConfig() as { error: { message: string }}
    } catch(e){
      expect((e as Error).message).toBe("Failed to fetch")
    }

    process.env.NODE_ENV = originalNodeEnv;
  });
});