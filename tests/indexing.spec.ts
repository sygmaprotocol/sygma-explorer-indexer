import { app } from "../src/app";
import { expect } from "chai";
import TransferRepository from "../src/indexer/repository/transfer";


const NUMBER_OF_TRANSFERS = 32; 

describe("Testing transfers", async function() {
    //this.timeout(2000)
    before(async () => {  
        console.log("here")
        const transferRepository = new TransferRepository() 
        let transferCount = 0; 
        while (transferCount < NUMBER_OF_TRANSFERS){
            console.log("here")
            transferCount = await transferRepository.transfer.count(); 
            console.log(transferCount)
        }
        console.log("here")

    }); 
    
    it("Test erc20", async () => {
        console.log("here")
    
        const response = await app.inject({
            method: "GET",
            url:{
                pathname: "/api/transfers",
                port: 8000
            },
        })
        console.log("here2")
        
        console.log(response.statusCode)
        //console.log()
        expect(response.statusCode).to.be.deep.equal(200)

    }); 
  })