import { expect } from "chai"
import axios from "axios"
import { Transfer, Resource, Fee, Deposit, Execution, Domain } from "@prisma/client"

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
    })

    it("Should successfully fetch all ERC721TST transfers from domain 1 to domain 2", async () => {
      const res = await axios.get(`http://localhost:8000/api/resources/${ERC721TST_RESOURCE_ID}/domains/source/${DOMAIN_1}/destination/${DOMAIN_2}/transfers?page=1&limit=100`)
      const transfers = res.data as Array<TransferResponse>
      
      expect(res.status).to.be.deep.equal(200)
      expect(transfers.length).to.be.deep.equal(1)
    })

    it("Should successfully fetch all permissionless generic transfers from domain 1 to domain 2", async () => {
      const res = await axios.get(`http://localhost:8000/api/resources/${PERMISSIONLESS_GENERIC_RESOURCE_ID}/domains/source/${DOMAIN_1}/destination/${DOMAIN_2}/transfers?page=1&limit=100`)
      const transfers = res.data as Array<TransferResponse>
      
      expect(res.status).to.be.deep.equal(200)
      expect(transfers.length).to.be.deep.equal(1)
    })

    it("Should successfully fetch all ERC20LRTEST transfers from domain 3 to domain 1", async () => {
      const res = await axios.get(`http://localhost:8000/api/resources/${ERC20LRTEST_RESOURCE_ID}/domains/source/${DOMAIN_3}/destination/${DOMAIN_1}/transfers?page=1&limit=100`)
      const transfers = res.data as Array<TransferResponse>
      
      expect(res.status).to.be.deep.equal(200)
      expect(transfers.length).to.be.deep.equal(3)
    })
})