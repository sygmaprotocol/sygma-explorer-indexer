import { expect } from "chai";
import TransferRepository from "../../src/indexer/repository/transfer";
import axios from "axios"


const NUMBER_OF_TRANSFERS = 32; 

describe("Testing transfers", async function() {
    //this.timeout(20000)
    before(async () => {  
        const transferRepository = new TransferRepository() 
        let transferCount = 0; 
        //while (transferCount < NUMBER_OF_TRANSFERS){
            console.log("here")
            //transferCount = await transferRepository.transfer.count(); 
            console.log(transferCount)
        //}
    }); 
    
    it("Test erc20", async () => {

        const response = await axios.get("http://localhost:8000/api/transfers?page=1&limit=35")
        
        console.log(response.status)
        expect(response.status).to.be.deep.equal(200)
    

    }); 
  })