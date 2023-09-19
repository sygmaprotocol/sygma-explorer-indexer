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
 
const DOMAIN_1 = "1"
const DOMAIN_2 = "2"
const DOMAIN_3 = "3"

describe("Get all transfers from a source domain to a destination domain", function () {
    
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

    it("Should successfully fetch all transfers from domain 1 to domain 2", async () => {
        const res = await axios.get(`http://localhost:8000/api/domains/source/${DOMAIN_1}/destination/${DOMAIN_2}/transfers?page=1&limit=100`)
        const transfers = res.data as Array<TransferResponse>
        
        expect(transfers.length).to.be.deep.equal(30)

        for (let transfer of transfers){
          expect(transfer.fromDomainId).to.be.deep.equal(parseInt(DOMAIN_1))
          expect(transfer.toDomainId).to.be.deep.equal(parseInt(DOMAIN_2))
        }
    })

    it("Should successfully fetch all transfers from domain 1 to domain 3", async () => {
        const res = await axios.get(`http://localhost:8000/api/domains/source/${DOMAIN_1}/destination/${DOMAIN_3}/transfers?page=1&limit=100`)
        const transfers = res.data as Array<TransferResponse> 

        expect(transfers.length).to.be.deep.equal(2)

        for (let transfer of transfers){
          expect(transfer.fromDomainId).to.be.deep.equal(parseInt(DOMAIN_1))
          expect(transfer.toDomainId).to.be.deep.equal(parseInt(DOMAIN_3))
        }
    })

    it("Should successfully fetch all transfers from domain 3 to domain 1", async () => {
      const res = await axios.get(`http://localhost:8000/api/domains/source/${DOMAIN_3}/destination/${DOMAIN_1}/transfers?page=1&limit=100`)
      const transfers = res.data as Array<TransferResponse> 

      expect(transfers.length).to.be.deep.equal(3)

      for (let transfer of transfers){
        expect(transfer.fromDomainId).to.be.deep.equal(parseInt(DOMAIN_3))
        expect(transfer.toDomainId).to.be.deep.equal(parseInt(DOMAIN_1))
      }
  })
})