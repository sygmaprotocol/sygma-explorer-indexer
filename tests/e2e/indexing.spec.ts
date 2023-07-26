import { expect } from "chai";
import TransferRepository from "../../src/indexer/repository/transfer";
import axios from "axios"


const NUMBER_OF_TRANSFERS = 35; 

describe("Testing transfers", async function() {
    
    it("Test number of transactions", async () => {

        const response = await axios.get("http://localhost:8000/api/transfers?page=1&limit=35")
        const data = response.data as Array<any>

        expect(response.status).to.be.deep.equal(200)
        expect(data.length).to.be.deep.equal(NUMBER_OF_TRANSFERS)        

    }); 

    it("Test")
  })