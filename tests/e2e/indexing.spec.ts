import { expect } from "chai"
import axios from "axios"
import { Transfer, Resource, Fee, Deposit, Execution, Domain } from "@prisma/client"
import { DomainTypes } from "../../src/indexer/config"
import { DepositType } from "../../src/indexer/services/evmIndexer/evmTypes"

const NUMBER_OF_TRANSFERS = 35
const NUMBER_OF_SUBSTRATE_DEPOSITS = 3
const NUMBER_OF_FUNGIBLE_DEPOSITS = 32
const NUMBER_OF_PERMISSIONLESS_DEPOSITS = 1
const NUMBER_OF_PERMISSIONED_DEPOSITS = 1
const NUMBER_OF_NFT_DEPOSITS = 1

type TransferResponse = Transfer & {
  resource: Resource
  toDomain: Domain
  fromDomain: Domain
  fee: Fee
  deposit: Deposit
  execution: Execution
}
describe("Indexer e2e tests", function () {
  let substrateDeposits = 0
  let fungibleDeposits = 0
  let permissionlessDeposits = 0
  let permissionedDeposits = 0
  let nftDeposits = 0

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

  it("Should succesfully fetch all transfers", async () => {
    const res = await axios.get("http://localhost:8000/api/transfers?page=1&limit=100")
    const transfers = res.data as Array<TransferResponse>

    for (const transfer of transfers) {
      if (transfer.fromDomain.name.toLowerCase() == DomainTypes.SUBSTRATE) {
        substrateDeposits++
      }
      switch (transfer.resource.type) {
        case DepositType.FUNGIBLE: {
          fungibleDeposits++
          break
        }
        case DepositType.NONFUNGIBLE: {
          nftDeposits++
          break
        }
        case DepositType.PERMISSIONLESS_GENERIC: {
          permissionlessDeposits++
          break
        }
        case DepositType.PERMISSIONED_GENERIC: {
          permissionedDeposits++
          break
        }
      }
    }

    expect(transfers.length).to.be.deep.equal(NUMBER_OF_TRANSFERS)
    expect(substrateDeposits).to.be.eq(NUMBER_OF_SUBSTRATE_DEPOSITS)
    expect(fungibleDeposits).to.be.eq(NUMBER_OF_FUNGIBLE_DEPOSITS)
    expect(permissionlessDeposits).to.be.eq(NUMBER_OF_PERMISSIONLESS_DEPOSITS)
    expect(permissionedDeposits).to.be.eq(NUMBER_OF_PERMISSIONED_DEPOSITS)
    expect(nftDeposits).to.be.eq(NUMBER_OF_NFT_DEPOSITS)

    transfers.map(transfer => {
      expect(transfer.id).to.be.not.null
      expect(transfer.depositNonce).to.be.not.null
      expect(transfer.fromDomain).to.be.not.null
      expect(transfer.fromDomainId).to.be.not.null
      expect(transfer.status).to.be.not.null
      expect(transfer.amount).to.be.not.null
      expect(transfer.destination).to.be.not.null
      expect(transfer.resource).to.be.not.null
      expect(transfer.resourceID).to.be.not.null
      expect(transfer.accountId).to.be.not.null
      expect(transfer.timestamp).to.be.not.null
      expect(transfer.toDomain).to.be.not.null
      expect(transfer.toDomainId).to.be.not.null
      expect(transfer.execution).to.be.not.null
    })
  })
})
