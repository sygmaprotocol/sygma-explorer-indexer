import BasicFeeHandlerContract from "@chainsafe/chainbridge-contracts/build/contracts/BasicFeeHandler.json"
import { BigNumber } from "@ethersproject/bignumber"
import {
  Contract,
  LogDescription,
  Provider,
  TransactionReceipt,
  getBytes,
  formatUnits,
  AbiCoder,
  hexlify,
  Log,
  BytesLike,
  BigNumberish,
} from "ethers"
import { Domain, Resource, ResourceTypes } from "indexer/config"
import { BridgeABI } from "../contract/constants"
import { logger } from "../../../utils/logger"
import { getERC20Contract } from "../contract"
import {
  DecodedDepositLog,
  DecodedFailedHandlerExecution,
  DecodedFeeCollectedLog,
  DecodedLogs,
  DecodedProposalExecutionLog,
  EventType,
  FeeHandlerType,
} from "./evmTypes"

export const nativeTokenAddress = "0x0000000000000000000000000000000000000000"

export async function decodeLogs(provider: Provider, domain: Domain, logs: Log[], resourceMap: Map<string, Resource>): Promise<DecodedLogs> {
  const decodedLogs: DecodedLogs = {
    deposit: [],
    proposalExecution: [],
    errors: [],
    feeCollected: [],
  }
  await Promise.all(
    logs.map(async log => {
      const blockUnixTimestamp = (await provider.getBlock(log.blockNumber))?.timestamp || 0
      const contractData = domain.feeHandlers.filter(handler => handler.address == log.address)

      let decodedLog: LogDescription | null = null
      if (contractData[0]?.type == FeeHandlerType.BASIC) {
        const contract = new Contract(contractData[0].address, BasicFeeHandlerContract.abi, provider)
        decodedLog = contract.interface.parseLog(log.toJSON() as { topics: string[]; data: string })
      } else if (contractData[0]?.type == FeeHandlerType.ORACLE) {
        const contract = new Contract(contractData[0].address, BasicFeeHandlerContract.abi, provider)
        decodedLog = contract.interface.parseLog(log.toJSON() as { topics: string[]; data: string })
      } else if (domain.bridge.toLowerCase() == log.address.toLowerCase()) {
        const contract = new Contract(domain.bridge, BridgeABI, provider)
        decodedLog = contract.interface.parseLog(log.toJSON() as { topics: string[]; data: string })
      }

      if (decodedLog) {
        const txReceipt = await provider.getTransactionReceipt(log.transactionHash)
        if (!txReceipt) {
          logger.warn("No txReceipt")
          return
        }
        switch (decodedLog.name) {
          case EventType.DEPOSIT: {
            const deposit = parseDeposit(domain, log, decodedLog, txReceipt, blockUnixTimestamp, resourceMap)
            decodedLogs.deposit.push(deposit)
            break
          }

          case EventType.PROPOSAL_EXECUTION: {
            const execution = parseProposalExecution(log, decodedLog, txReceipt, blockUnixTimestamp, resourceMap)
            decodedLogs.proposalExecution.push(execution)
            break
          }

          case EventType.FAILED_HANDLER_EXECUTION: {
            const errorData = parseFailedHandlerExecution(log, decodedLog)
            decodedLogs.errors.push(errorData)
            break
          }

          case EventType.FEE_COLLECTED: {
            const feeCollected = await parseFeeCollected(decodedLog, provider, domain.nativeTokenSymbol, log)
            decodedLogs.feeCollected.push(feeCollected)
            break
          }
        }
      }
    }),
  )

  return decodedLogs
}

export function parseDeposit(
  domain: Domain,
  log: Log,
  decodedLog: LogDescription,
  txReceipt: TransactionReceipt,
  blockUnixTimestamp: number,
  resourceMap: Map<string, Resource>,
): DecodedDepositLog {
  const resourceType = resourceMap.get(decodedLog.args.resourceID as string)?.type || ""
  const resourceDecimals = resourceMap.get(decodedLog.args.resourceID as string)?.decimals || 18

  const arrayifyData = getBytes(decodedLog.args.data as BytesLike)
  const filtered = arrayifyData.filter((_, idx) => idx + 1 > 65)
  const hexAddress = hexlify(filtered)
  const destDomainID = decodedLog.args.destinationDomainID as number
  return {
    blockNumber: log.blockNumber,
    depositNonce: Number(decodedLog.args.depositNonce),
    toDomainId: destDomainID.toString(),
    sender: txReceipt.from,
    destination: hexAddress,
    fromDomainId: domain.id.toString(),
    resourceID: decodedLog.args.resourceID as string,
    txHash: log.transactionHash,
    timestamp: blockUnixTimestamp,
    depositData: decodedLog.args.data as string,
    handlerResponse: decodedLog.args.handlerResponse as string,
    transferType: resourceType,
    amount: decodeAmountsOrTokenId(decodedLog.args.data as string, resourceDecimals, resourceType),
  }
}

export function parseProposalExecution(
  log: Log,
  decodedLog: LogDescription,
  txReceipt: TransactionReceipt,
  blockUnixTimestamp: number,
  resourceMap: Map<string, Resource>,
): DecodedProposalExecutionLog {
  const resourceType = resourceMap.get(decodedLog.args.resourceID as string)?.type || ""
  const originDomainID = decodedLog.args.originDomainID as number
  return {
    blockNumber: log.blockNumber,
    from: txReceipt.from,
    depositNonce: Number(decodedLog.args.depositNonce as string),
    txHash: log.transactionHash,
    timestamp: blockUnixTimestamp,
    fromDomainId: originDomainID.toString(),
    transferType: resourceType,
    resourceID: decodedLog.args.resourceID as string,
  }
}

export async function parseFeeCollected(
  decodedLog: LogDescription,
  provider: Provider,
  nativeTokenSymbol: string,
  log: Log,
): Promise<DecodedFeeCollectedLog> {
  const ercToken = getERC20Contract(provider, decodedLog.args.tokenAddress as string)

  return {
    amount: BigNumber.from(decodedLog.args.fee as number).toString(),
    tokenSymbol: (decodedLog.args.tokenAddress as string) == nativeTokenAddress ? nativeTokenSymbol : (await ercToken?.symbol()) || "",
    tokenAddress: decodedLog.args.tokenAddress as string,
    txHash: log.transactionHash,
  }
}

export function parseFailedHandlerExecution(log: Log, decodedLog: LogDescription): DecodedFailedHandlerExecution {
  const originDomainID = decodedLog.args.originDomainID as number
  return {
    domainId: originDomainID.toString(),
    depositNonce: Number(decodedLog.args.depositNonce as string),
    txHash: log.transactionHash,
    blockNumber: log.blockNumber,
  }
}

function decodeAmountsOrTokenId(data: string, decimals: number, type: ResourceTypes | ""): string {
  if (type === ResourceTypes.FUNGIBLE) {
    const amount = AbiCoder.defaultAbiCoder().decode(["uint256"], data)[0] as BigNumberish
    return formatUnits(amount, decimals)
  } else if (type === ResourceTypes.NON_FUNGIBLE) {
    const tokenId = AbiCoder.defaultAbiCoder().decode(["uint256"], data)[0] as number
    return tokenId.toString()
  }

  return ""
}
