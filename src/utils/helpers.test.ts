import { buildQueryParamsToPasss } from './helpers'

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