import { expect } from "chai";
import TransferRepository from "../../src/indexer/repository/transfer";
import axios from "axios"


const NUMBER_OF_TRANSFERS = 35; 

describe("Testing transfers", async function() {
    
    it("Test transfer count and required fields", async () => {

        const response = await axios.get("http://localhost:8000/api/transfers?page=1&limit=35")
        expect(response.status).to.be.deep.equal(200)
        
        const transfers = response.data as Array<any>
        expect(transfers.length).to.be.deep.equal(NUMBER_OF_TRANSFERS)
        
        transfers.map((transfer) => {
            expect(transfer.id).to.be.not.null 
            expect(transfer.depositNonce).to.be.not.null
            expect(transfer.fromDomain).to.be.not.null 
            expect(transfer.fromDomainId).to.be.not.null
            expect(transfer.status).to.be.not.null
        })
    }); 
    
  })