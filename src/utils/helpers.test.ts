import { SharedConfigDomains } from 'types';
import { buildQueryParamsToPasss, formatConfig } from './helpers'
import devnetSharedConfig from './mocks/devnet-shared-config'
import testnetSharedConfig from './mocks/testnet-shared-config'

describe('buildQueryParamsToPasss', () => {
  it('builds query params without passing filters', () => {
      const expectedKeys = ['before', 'after', 'first', 'last']

      const result = buildQueryParamsToPasss({ before: undefined, first: '10', after: undefined, last: undefined })

      const keys = Object.keys(result)
      expect(expectedKeys).toEqual(keys)
  })
  
  it('builds query params passing filters', () => {
    const expectedKeys = ['before', 'after', 'first', 'last', 'filters']
    
    const result = buildQueryParamsToPasss({
      before: undefined,
      first: '10',
      after: undefined,
      last: undefined,
      filters: {
        fromAddress: '0xff93B45308FD417dF303D6515aB04D9e89a750Ca'
      }
    })

    const keys = Object.keys(result)

    expect(expectedKeys).toEqual(keys)
  })
})

describe('formatConfig', () => {
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



  it('should return the config for devnet', () => {
    const formatedConfig = formatConfig(devnetSharedConfig as unknown as SharedConfigDomains, "devnet")
    const substrateDomainFiltered = formatedConfig.filter((config) => config.type !== "substrate")

    const keys = Object.keys(substrateDomainFiltered[0])
    keys.forEach(key => {
      const foundExpectedKey = expectedKeys.find(expectedKey => expectedKey === key)
      expect(foundExpectedKey).not.toBe(undefined)
    })
  })

  it('should return the config for testnet', () => {
    const formatedConfig = formatConfig(testnetSharedConfig as unknown as SharedConfigDomains, "testnet")
    const substrateDomainFiltered = formatedConfig.filter((config) => config.type !== "substrate")

    const keys = Object.keys(substrateDomainFiltered[0])
    keys.forEach(key => {
      const foundExpectedKey = expectedKeys.find(expectedKey => expectedKey === key)
      expect(foundExpectedKey).not.toBe(undefined)
    })
  })
})
