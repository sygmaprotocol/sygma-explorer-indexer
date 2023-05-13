import { SharedConfigDomains } from 'types';
import { formatConfig } from './helpers'
import devnetSharedConfig from './mocks/devnet-shared-config'
import testnetSharedConfig from './mocks/testnet-shared-config'

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
