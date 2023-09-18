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

const NUMBER_OF_ERC20TST_TRANSFERS = 26
const NUMBER_OF_ERC20LRTEST_TRANSFERS = 6
const NUMBER_OF_ERC721TST_TRANSFERS = 1
const NUMBER_OF_PERMISSIONLESS_TRANSFERS = 1
const NUMBER_OF_PERMISSIONED_TRANSFERS = 1

const ERC20TST_RESOURCE_ID = "0x0000000000000000000000000000000000000000000000000000000000000000"
const ERC20LRTEST_RESOURCE_ID = "0x0000000000000000000000000000000000000000000000000000000000000300"
const ERC721TST_RESOURCE_ID = "0x0000000000000000000000000000000000000000000000000000000000000200"
const PERMISSIONLESS_GENERIC_RESOURCE_ID = "0x0000000000000000000000000000000000000000000000000000000000000500"
const PERMISSIONED_GENERIC_RESOURCE_ID = "0x0000000000000000000000000000000000000000000000000000000000000100"

describe("Get all transfers for a specific resource", function () {
    
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

    it("Should successfully fetch all ERC20TST transfers", async () => {
        const res = await axios.get(`http://localhost:8000/api/resources/${ERC20TST_RESOURCE_ID}/transfers?page=1&limit=100`)
        const transfers = res.data as Array<TransferResponse>
        
        expect(res.status).to.be.deep.equal(200)
        expect(transfers.length).to.be.deep.equal(NUMBER_OF_ERC20TST_TRANSFERS)
    })

    it("Should successfully fetch all ERC20LRTest transfers", async () => {
        const res = await axios.get(`http://localhost:8000/api/resources/${ERC20LRTEST_RESOURCE_ID}/transfers?page=1&limit=100`)
        const transfers = res.data as Array<TransferResponse>
        
        expect(res.status).to.be.deep.equal(200)
        expect(transfers.length).to.be.deep.equal(NUMBER_OF_ERC20LRTEST_TRANSFERS)
    })

    it("Should successfully fetch all ERC721TST transfers", async () => {
        const res = await axios.get(`http://localhost:8000/api/resources/${ERC721TST_RESOURCE_ID}/transfers?page=1&limit=100`)
        const transfers = res.data as Array<TransferResponse>
        
        expect(res.status).to.be.deep.equal(200)
        expect(transfers.length).to.be.deep.equal(NUMBER_OF_ERC721TST_TRANSFERS)
    })

    it("Should successfully fetch all permissionless generic transfers", async () => {
        const res = await axios.get(`http://localhost:8000/api/resources/${PERMISSIONLESS_GENERIC_RESOURCE_ID}/transfers?page=1&limit=100`)
        const transfers = res.data as Array<TransferResponse>
        
        expect(res.status).to.be.deep.equal(200)
        expect(transfers.length).to.be.deep.equal(NUMBER_OF_PERMISSIONLESS_TRANSFERS)
    })

    it("Should successfully fetch all permissioned generic transfers", async () => {
        const res = await axios.get(`http://localhost:8000/api/resources/${PERMISSIONED_GENERIC_RESOURCE_ID}/transfers?page=1&limit=100`)
        const transfers = res.data as Array<TransferResponse>
        
        expect(res.status).to.be.deep.equal(200)
        expect(transfers.length).to.be.deep.equal(NUMBER_OF_PERMISSIONED_TRANSFERS)
    })

})
