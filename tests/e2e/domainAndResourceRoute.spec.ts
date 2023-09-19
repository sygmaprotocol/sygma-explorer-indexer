import { expect } from "chai"
import axios from "axios"
import { Transfer, Resource, Fee, Deposit, Execution, Domain, TransferStatus } from "@prisma/client"

type TransferResponse = Transfer & {
    resource: Resource
    toDomain: Domain
    fromDomain: Domain
    fee: Fee
    deposit: Deposit
    execution: Execution
}

const ERC20TST_RESOURCE_ID = "0x0000000000000000000000000000000000000000000000000000000000000000"
const ERC20LRTEST_RESOURCE_ID = "0x0000000000000000000000000000000000000000000000000000000000000300"
const ERC721TST_RESOURCE_ID = "0x0000000000000000000000000000000000000000000000000000000000000200"
const PERMISSIONLESS_GENERIC_RESOURCE_ID = "0x0000000000000000000000000000000000000000000000000000000000000500"

const DOMAIN_1 = "1"
const DOMAIN_2 = "2"
const DOMAIN_3 = "3"

describe("Get all transfers for a specific resource between source and destination domains", function () {

    before(async () => {
        let transfers = 0
        let isProcessing = false
        while (transfers !== 35 || isProcessing) {
          const res: { data: Array<TransferResponse> } = await axios.get("http://localhost:8000/api/transfers?page=1&limit=100")
    
          transfers = res.data.length
    
          isProcessing = false
          for (const transfer of res.data) {
            if (!transfer.deposit || !transfer.execution) {
              isProcessing = true
            }
          }
        }
    })

    it("Should successfully fetch all ERC20TST transfers from domain 1 to domain 2", async () => {
        const res = await axios.get(`http://localhost:8000/api/resources/${ERC20TST_RESOURCE_ID}/domains/source/${DOMAIN_1}/destination/${DOMAIN_2}/transfers?page=1&limit=100`)
        const transfers = res.data as Array<TransferResponse>
        
        expect(res.status).to.be.deep.equal(200)
        expect(transfers.length).to.be.deep.equal(26)

        for (let transfer of transfers){
          expect(transfer.resourceID).to.be.deep.equal(ERC20TST_RESOURCE_ID)
          expect(transfer.fromDomainId).to.be.deep.equal(parseInt(DOMAIN_1))
          expect(transfer.toDomainId).to.be.deep.equal(parseInt(DOMAIN_2))       
        }
    })

    it("Should successfully fetch all ERC721TST transfers from domain 1 to domain 2", async () => {
      const res = await axios.get(`http://localhost:8000/api/resources/${ERC721TST_RESOURCE_ID}/domains/source/${DOMAIN_1}/destination/${DOMAIN_2}/transfers?page=1&limit=100`)
      const transfers = res.data as Array<TransferResponse>
      
      expect(res.status).to.be.deep.equal(200)
      expect(transfers.length).to.be.deep.equal(1)

      expect(transfers[0]).to.be.deep.equal(
        {
          id: '65098e3fb1ebdfe6863b6231',
          depositNonce: 2,
          resourceID: '0x0000000000000000000000000000000000000000000000000000000000000200',
          fromDomainId: 1,
          toDomainId: 2,
          destination: '0x8e0a907331554af72563bd8d43051c2e64be5d35',
          amount: '2296080355773541392',
          timestamp: '2023-07-17T08:31:22.000Z',
          status: 'executed',
          accountId: '0x5C1F5961696BaD2e73f73417f07EF55C62a2dC5b',
          message: '',
          usdValue: null,
          resource: {
            type: 'nonfungible',
            id: '0x0000000000000000000000000000000000000000000000000000000000000200'
          },
          toDomain: { name: 'evm2', lastIndexedBlock: transfers[0].toDomain.lastIndexedBlock, id: 2 },
          fromDomain: { name: 'Ethereum 1', lastIndexedBlock: transfers[0].fromDomain.lastIndexedBlock, id: 1 },
          fee: {
            amount: '1000000000000000',
            tokenAddress: '0x0000000000000000000000000000000000000000',
            tokenSymbol: 'eth'
          },
          deposit: {
            txHash: '0x7b7c2be6b60c25a1be9f506fdd75e1aab76d3016f0bc708715405f2e6718c6df',
            blockNumber: '591',
            depositData: '0x0000000000000000000000000000000000000000000000001fdd50eb1da26c1000000000000000000000000000000000000000000000000000000000000000148e0a907331554af72563bd8d43051c2e64be5d35000000000000000000000000000000000000000000000000000000000000000c6d657461646174612e75726c',
            handlerResponse: '0x6d657461646174612e746573746d657461646174612e75726c'
          },
          execution: {
            txHash: '0x3de2201e548a8332aaa50147a2fb02e2b6669184f042b4dbcf23b4f5d40edcfb',
            blockNumber: '598'
          },
          account: { addressStatus: '' }
        }
      )

    })

    it("Should successfully fetch all permissionless generic transfers from domain 1 to domain 2", async () => {
      const res = await axios.get(`http://localhost:8000/api/resources/${PERMISSIONLESS_GENERIC_RESOURCE_ID}/domains/source/${DOMAIN_1}/destination/${DOMAIN_2}/transfers?page=1&limit=100`)
      const transfers = res.data as Array<TransferResponse>
      
      expect(res.status).to.be.deep.equal(200)
      expect(transfers.length).to.be.deep.equal(1)

      expect(transfers[0]).to.be.deep.equal({
        id: '65098e41b1ebdfe6863b628c',
        depositNonce: 29,
        resourceID: '0x0000000000000000000000000000000000000000000000000000000000000500',
        fromDomainId: 1,
        toDomainId: 2,
        destination: '0x696bad2e73f73417f07ef55c62a2dc5b47ed248f568cc8f9fe4371a1d1fab88a62af595f8efb9aeff6f0e043b7ea33b10000000000000000000000005c1f5961696bad2e73f73417f07ef55c62a2dc5b',
        amount: '',
        timestamp: '2023-07-17T08:32:27.000Z',
        status: 'executed',
        accountId: '0x5C1F5961696BaD2e73f73417f07EF55C62a2dC5b',
        message: '',
        usdValue: null,
        resource: {
          type: 'permissionlessGeneric',
          id: '0x0000000000000000000000000000000000000000000000000000000000000500'
        },
        toDomain: { name: 'evm2', lastIndexedBlock: transfers[0].toDomain.lastIndexedBlock, id: 2 },
        fromDomain: { name: 'Ethereum 1', lastIndexedBlock: transfers[0].fromDomain.lastIndexedBlock, id: 1 },
        fee: {
          amount: '1000000000000000',
          tokenAddress: '0x0000000000000000000000000000000000000000',
          tokenSymbol: 'eth'
        },
        deposit: {
          txHash: '0x18fa527a4773789a5ba487dae5bc3d00cc04dc50509b6f67e438efdb60e75c67',
          blockNumber: '623',
          depositData: '0x0000000000000000000000000000000000000000000000000000000000030d400004ea287d1514b1387b365ae7294ea13bad9db83436e671dd16ba145c1f5961696bad2e73f73417f07ef55c62a2dc5b47ed248f568cc8f9fe4371a1d1fab88a62af595f8efb9aeff6f0e043b7ea33b10000000000000000000000005c1f5961696bad2e73f73417f07ef55c62a2dc5b',
          handlerResponse: '0x'
        },
        execution: {
          txHash: '0xcc7c318cfd71745c27111772f21dec553f53277c9dc218fe07b54f897560c0cb',
          blockNumber: '631'
        },
        account: { addressStatus: '' }
      })

    })

    it("Should successfully fetch all ERC20LRTEST transfers from domain 3 to domain 1", async () => {
      const res = await axios.get(`http://localhost:8000/api/resources/${ERC20LRTEST_RESOURCE_ID}/domains/source/${DOMAIN_3}/destination/${DOMAIN_1}/transfers?page=1&limit=100`)
      const transfers = res.data as Array<TransferResponse>
      
      expect(res.status).to.be.deep.equal(200)
      expect(transfers.length).to.be.deep.equal(3)

      for (let transfer of transfers){
        expect(transfer.resourceID).to.be.deep.equal(ERC20LRTEST_RESOURCE_ID)
        expect(transfer.fromDomainId).to.be.deep.equal(parseInt(DOMAIN_3))
        expect(transfer.toDomainId).to.be.deep.equal(parseInt(DOMAIN_1))
      }
    })
})