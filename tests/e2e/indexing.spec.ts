import { expect } from "chai";
import axios from "axios"


const NUMBER_OF_TRANSFERS = 32; 

describe("E2E tests - EVM", async function() {

    let evmTransfers: Array<any> 

    before(async() =>{
        const response = await axios.get("http://localhost:8000/api/transfers?page=1&limit=100")
        expect(response.status).to.be.deep.equal(200)

        const transfers = response.data as Array<any>
        //expect(transfers.length).to.be.deep.equal(NUMBER_OF_TRANSFERS)

        evmTransfers = transfers.filter((transfer) => 
            transfer.fromDomain.name == "Ethereum 1" && transfer.toDomain.name == "evm2"
            || transfer.fromDomain.name == "evm2" && transfer.toDomain.name == "Ethereum 1") 
        })
    
    it("Expect transfer count matches", async () => {

        expect(evmTransfers.filter((transfer) => 
            transfer.fromDomain.name == "Ethereum 1" && transfer.toDomain.name == "evm2"
        ).length).to.be.deep.equal(57);  //number should be checked

        /* --- There are currently no evm2 => Ethereum 1 transfers --- 
        expect(evmTransfers.filter((transfer) => 
            transfer.fromDomain.name == "evm2" && transfer.toDomain.name == "Ethereum 1"
        ).length).to.be.deep.equal(0);  //number should be checked
        */
    }); 

    it("Expect token amount matches", async() => {

        //ERC20TST amount
        expect(evmTransfers.filter((transfer) => 
            transfer.fromDomain.name == "Ethereum 1" && transfer.toDomain.name == "evm2"
            && transfer.resourceID == "0x0000000000000000000000000000000000000000000000000000000000000000"
        ).reduce((sumAmount, transfer) => sumAmount + parseFloat(transfer.amount),0)
        ).to.be.deep.equal(3.5000000000000013e-15);  //number should be checked

        //ERC20LRTest amount
        expect(evmTransfers.filter((transfer) => 
            transfer.fromDomain.name == "Ethereum 1" && transfer.toDomain.name == "evm2"
            && transfer.resourceID == "0x0000000000000000000000000000000000000000000000000000000000000300"
        ).reduce((sumAmount, transfer) => sumAmount + parseFloat(transfer.amount),0)
        ).to.be.deep.equal(2e-16);  //number should be checked

        //ERC721TST amount
        expect(evmTransfers.filter((transfer) => 
            transfer.fromDomain.name == "Ethereum 1" && transfer.toDomain.name == "evm2"
            && transfer.resourceID == "0x0000000000000000000000000000000000000000000000000000000000000200"
        ).reduce((sumAmount, transfer) => sumAmount + parseFloat(transfer.amount),0)
        ).to.be.deep.equal(4592160711547083000);  //number should be checked

        // --- There are currently no evm2 => Ethereum 1 transfers ---  
    })

    it("Expect collected fee matches", () => {

        expect(evmTransfers.filter((transfer) => 
            transfer.fromDomain.name == "Ethereum 1" && transfer.toDomain.name == "evm2"
            && transfer.fee != null
        ).reduce((feeCollected, transfer) => 
            feeCollected + parseFloat(transfer.fee.amount), 0)
        ).to.be.deep.equal(4000000000000000) //number should be checked

        /* --- There are currently no evm2 => Ethereum 1 transfers --- 
        expect(evmTransfers.filter((transfer) => 
            transfer.fromDomain.name == "evm2" && transfer.toDomain.name == "Ethereum 1"
            && transfer.fee != null
        ).reduce((feeCollected, transfer) => 
            feeCollected + parseFloat(transfer.fee.amount), 0)
        ).to.be.deep.equal(0) //number should be checked
        */

    })

  })