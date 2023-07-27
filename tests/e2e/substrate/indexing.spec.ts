import { expect } from "chai";
import axios from "axios"

const SUBSTRATE_TRANSFERS_COUNT = 5; //should be checked

describe("E2E tests - Substrate", async function() {

    let substrateTransfers: Array<any>

    before(async() => {
        const response = await axios.get("http://localhost:8000/api/transfers?page=1&limit=100")
        expect(response.status).to.be.deep.equal(200)

        const transfers = response.data as Array<any>

        substrateTransfers = transfers.filter((transfer) => 
            transfer.fromDomain.name == "Substrate" || transfer.toDomain.name == "Substrate") 
    
    })

    it("Expect transaction count matches", () => {

        expect(substrateTransfers.length).to.be.deep.equal(SUBSTRATE_TRANSFERS_COUNT)

        expect(substrateTransfers.filter((transfer) => 
            transfer.fromDomain.name == "Substrate" && transfer.toDomain.name == "Ethereum 1"
        ).length).to.be.deep.equal(3);  //number should be checked

       
        expect(substrateTransfers.filter((transfer) => 
            transfer.fromDomain.name == "Ethereum 1" && transfer.toDomain.name == "Substrate"
        ).length).to.be.deep.equal(2);  //number should be checked


        /* --- There are currently no substrate <=> evm2 transfers ---
        expect(substrateTransfers.filter((transfer) => 
        transfer.fromDomain.name == "Substrate" && transfer.toDomain.name == "evm2"
        ).length).to.be.deep.equal(0);  //number should be checked

        expect(substrateTransfers.filter((transfer) => 
            transfer.fromDomain.name == "evm2" && transfer.toDomain.name == "Substrate"
        ).length).to.be.deep.equal(0);  //number should be checked
        */

    }); 

    it("Expect transferred amount matches", () => {

        expect(substrateTransfers.filter((transfer) => 
            transfer.fromDomain.name == "Substrate" && transfer.toDomain.name == "Ethereum 1"
        ).reduce((sumAmount, transfer) => 
            sumAmount + parseFloat(transfer.amount),0)
        ).to.be.deep.equal(1.0200000000000001e-10);  //number should be checked

        expect(substrateTransfers.filter((transfer) => 
            transfer.fromDomain.name == "Ethereum 1" && transfer.toDomain.name == "Substrate"
        ).reduce((sumAmount, transfer) => 
            sumAmount + parseFloat(transfer.amount),0)
        ).to.be.deep.equal(0.0002);  //number should be checked
        
        /* --- There are currently no substrate <=> evm2 transfers ---
        expect(substrateTransfers.filter((transfer) => 
            transfer.fromDomain.name == "Substrate" && transfer.toDomain.name == "evm2"
        ).reduce((sumAmount, transfer) => 
            sumAmount + transfer.amount,0)
        ).to.be.deep.equal(0);  //number should be checked

        expect(substrateTransfers.filter((transfer) => 
            transfer.fromDomain.name == "evm2" && transfer.toDomain.name == "Substrate"
        ).reduce((sumAmount, transfer) => 
            sumAmount + transfer.amount,0)
        ).to.be.deep.equal(0);  //number should be checked
        */
    })

    it("Expect collected fee matches", () => {

        expect(substrateTransfers.filter((transfer) => 
            transfer.fromDomain.name == "Ethereum 1" && transfer.toDomain.name == "Substrate"
        ).reduce((feeCollected, transfer) => 
            feeCollected + parseFloat(transfer.fee.amount), 0)
        ).to.be.deep.equal(2000000000000000) //number should be checked

        /* --- There are currently no substrate <=> evm2 transfers ---
        expect(substrateTransfers.filter((transfer) => 
            transfer.fromDomain.name == "evm2" && transfer.toDomain.name == "Substrate"
        ).reduce((feeCollected, transfer) => 
            feeCollected + parseFloat(transfer.fee.amount), 0)
        ).to.be.deep.equal(0) //number should be checked
        */
    })
  })