/*
The Licensed Work is (c) 2023 Sygma
SPDX-License-Identifier: LGPL-3.0-only
*/
import { TransferStatus } from "@prisma/client"
import { expect } from "chai"
import sinon, { SinonStubbedInstance } from "sinon"
import TransferRepository from "../../src/indexer/repository/transfer"
import { checkTransferStatus, createMessage } from "../../src/indexer/services/monitoringService"
import { NotificationSender } from "../../src/indexer/services/monitoringService/notificationSender"
import { convertMillisecondsToMinutes } from "../../src/utils/helpers"

describe("Monitoring service testing", function () {
  let notificationSenderStub: SinonStubbedInstance<NotificationSender>
  let transferRepositoryStub: SinonStubbedInstance<TransferRepository>

  before(() => {
    process.env.INCIDENT_TIME_MINUTES = "45"
    process.env.WARNING_TIME_MINUTES = "15"
    process.env.INCIDENT_TEMPLATE_PATH = "incidentTemplate.ejs"
    process.env.WARNING_TEMPLATE_PATH = "warningTemplate.ejs"
  })

  beforeEach(() => {
    transferRepositoryStub = sinon.createStubInstance(TransferRepository)
    notificationSenderStub = sinon.createStubInstance(NotificationSender)
  })

  afterEach(() => {
    sinon.restore()
  })

  it("Should send warning info", async () => {
    const transfers = [
      {
        id: "1",
        depositNonce: 2,
        resourceID: "0x0000000000000000000000000000000000000000000000000000000000000200",
        fromDomainId: 1,
        toDomainId: 2,
        destination: "0x8e0a907331554af72563bd8d43051c2e64be5d35",
        amount: "2296080355773541392",
        status: TransferStatus.pending,
        accountId: "0x5C1F5961696BaD2e73f73417f07EF55C62a2dC5b",
        message: "",
        usdValue: null,
        resource: {
          type: "nonfungible",
          id: "0x0000000000000000000000000000000000000000000000000000000000000200",
        },
        toDomain: { name: "evm2", lastIndexedBlock: 0, id: 2 },
        fromDomain: { name: "Ethereum 1", lastIndexedBlock: 0, id: 1 },
        fee: {
          amount: "1000000000000000",
          tokenAddress: "0x0000000000000000000000000000000000000000",
          tokenSymbol: "eth",
        },
        deposit: {
          id: "1",
          transferId: "1",
          type: "depositType",
          timestamp: new Date(Date.now() - 65 * 60 * 1000),
          txHash: "0x7b7c2be6b60c25a1be9f506fdd75e1aab76d3016f0bc708715405f2e6718c6df",
          blockNumber: "591",
          depositData:
            "0x0000000000000000000000000000000000000000000000001fdd50eb1da26c1000000000000000000000000000000000000000000000000000000000000000148e0a907331554af72563bd8d43051c2e64be5d35000000000000000000000000000000000000000000000000000000000000000c6d657461646174612e75726c",
          handlerResponse: "0x6d657461646174612e746573746d657461646174612e75726c",
        },
        execution: {
          txHash: "0x3de2201e548a8332aaa50147a2fb02e2b6669184f042b4dbcf23b4f5d40edcfb",
          blockNumber: "598",
        },
        account: { addressStatus: "" },
      },
    ]

    transferRepositoryStub.findTransfersByStatus.resolves(transfers)
    notificationSenderStub.sendNotification.callsFake(() => Promise.resolve())

    await checkTransferStatus(transferRepositoryStub, notificationSenderStub)

    expect(notificationSenderStub.sendNotification.calledOnce).to.be.true
    const msg = await createMessage(process.env.WARNING_TEMPLATE_PATH!, transfers[0], 65)
    expect(
      notificationSenderStub.sendNotification.calledWith({
        TopicArn: process.env.TOPIC_ARN,
        Message: msg,
      }),
    ).to.be.true
  })

  it("Should send warning info", async () => {
    const transfers = [
      {
        id: "1",
        depositNonce: 2,
        resourceID: "0x0000000000000000000000000000000000000000000000000000000000000200",
        fromDomainId: 1,
        toDomainId: 2,
        destination: "0x8e0a907331554af72563bd8d43051c2e64be5d35",
        amount: "2296080355773541392",
        status: TransferStatus.pending,
        accountId: "0x5C1F5961696BaD2e73f73417f07EF55C62a2dC5b",
        message: "",
        usdValue: null,
        resource: {
          type: "nonfungible",
          id: "0x0000000000000000000000000000000000000000000000000000000000000200",
        },
        toDomain: { name: "evm2", lastIndexedBlock: 0, id: 2 },
        fromDomain: { name: "Ethereum 1", lastIndexedBlock: 0, id: 1 },
        fee: {
          amount: "1000000000000000",
          tokenAddress: "0x0000000000000000000000000000000000000000",
          tokenSymbol: "eth",
        },
        deposit: {
          id: "1",
          transferId: "1",
          type: "depositType",
          txHash: "0x7b7c2be6b60c25a1be9f506fdd75e1aab76d3016f0bc708715405f2e6718c6df",
          blockNumber: "591",
          timestamp: new Date(Date.now() - 20 * 60 * 1000),
          depositData:
            "0x0000000000000000000000000000000000000000000000001fdd50eb1da26c1000000000000000000000000000000000000000000000000000000000000000148e0a907331554af72563bd8d43051c2e64be5d35000000000000000000000000000000000000000000000000000000000000000c6d657461646174612e75726c",
          handlerResponse: "0x6d657461646174612e746573746d657461646174612e75726c",
        },
        execution: {
          txHash: "0x3de2201e548a8332aaa50147a2fb02e2b6669184f042b4dbcf23b4f5d40edcfb",
          blockNumber: "598",
        },
        account: { addressStatus: "" },
      },
    ]

    transferRepositoryStub.findTransfersByStatus.resolves(transfers)
    notificationSenderStub.sendNotification.callsFake(() => Promise.resolve())

    await checkTransferStatus(transferRepositoryStub, notificationSenderStub)

    expect(notificationSenderStub.sendNotification.calledOnce).to.be.true
    const msg = await createMessage(process.env.WARNING_TEMPLATE_PATH!, transfers[0], 20)
    expect(
      notificationSenderStub.sendNotification.calledWith({
        TopicArn: process.env.TOPIC_ARN,
        Message: msg,
      }),
    ).to.be.true
  })

  it("Shouldn't send anything as time threshold wasn't reached", async () => {
    const transfers = [
      {
        id: "1",
        depositNonce: 2,
        resourceID: "0x0000000000000000000000000000000000000000000000000000000000000200",
        fromDomainId: 1,
        toDomainId: 2,
        destination: "0x8e0a907331554af72563bd8d43051c2e64be5d35",
        amount: "2296080355773541392",
        status: TransferStatus.pending,
        accountId: "0x5C1F5961696BaD2e73f73417f07EF55C62a2dC5b",
        message: "",
        usdValue: null,
        resource: {
          type: "nonfungible",
          id: "0x0000000000000000000000000000000000000000000000000000000000000200",
        },
        toDomain: { name: "evm2", lastIndexedBlock: 0, id: 2 },
        fromDomain: { name: "Ethereum 1", lastIndexedBlock: 0, id: 1 },
        fee: {
          amount: "1000000000000000",
          tokenAddress: "0x0000000000000000000000000000000000000000",
          tokenSymbol: "eth",
        },
        deposit: {
          id: "1",
          transferId: "1",
          type: "depositType",
          txHash: "0x7b7c2be6b60c25a1be9f506fdd75e1aab76d3016f0bc708715405f2e6718c6df",
          blockNumber: "591",
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          depositData:
            "0x0000000000000000000000000000000000000000000000001fdd50eb1da26c1000000000000000000000000000000000000000000000000000000000000000148e0a907331554af72563bd8d43051c2e64be5d35000000000000000000000000000000000000000000000000000000000000000c6d657461646174612e75726c",
          handlerResponse: "0x6d657461646174612e746573746d657461646174612e75726c",
        },
        execution: {
          txHash: "0x3de2201e548a8332aaa50147a2fb02e2b6669184f042b4dbcf23b4f5d40edcfb",
          blockNumber: "598",
        },
        account: { addressStatus: "" },
      },
    ]

    transferRepositoryStub.findTransfersByStatus.resolves(transfers)
    notificationSenderStub.sendNotification.callsFake(() => Promise.resolve())

    await checkTransferStatus(transferRepositoryStub, notificationSenderStub)

    expect(notificationSenderStub.sendNotification.calledOnce).to.be.false
  })

  it("Should successfully convert milliseconds to minutes", () => {
    expect(convertMillisecondsToMinutes(900000)).to.be.deep.equal(15)
    expect(convertMillisecondsToMinutes(2700000)).to.be.deep.equal(45)
    expect(convertMillisecondsToMinutes(3600000)).to.be.deep.equal(60)
  })
})
