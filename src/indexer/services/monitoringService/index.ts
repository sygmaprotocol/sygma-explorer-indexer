/*
The Licensed Work is (c) 2023 Sygma
SPDX-License-Identifier: LGPL-3.0-only
*/
import path from "path"
import { CronJob } from "cron"
import { DateTime } from "luxon"
import { TransferStatus } from "@prisma/client"
import ejs from "ejs"
import { convertMillisecondsToMinutes } from "../../../utils/helpers"
import TransferRepository, { TransferWithDeposit } from "../../repository/transfer"
import { logger } from "../../../utils/logger"
import { NotificationSender } from "./notificationSender"

export enum NotificationType {
  INCIDENT = "Incident",
  WARNING = "Warning",
}

export async function createMessage(templatePath: string, transfer: TransferWithDeposit, durationInMins: number): Promise<string> {
  const environment = process.env.SYGMA_ENV || ""
  return await ejs.renderFile(path.join(__dirname, templatePath), {
    txHash: transfer.deposit!.txHash,
    fromDomainId: transfer.fromDomainId,
    durationInMins: Math.round(durationInMins),
    environment: environment.toLowerCase(),
  })
}

export async function checkTransferStatus(transferRepository: TransferRepository, notificationSender: NotificationSender): Promise<void> {
  logger.info("Checking pending transfers")

  const transfers = await transferRepository.findTransfersByStatus(TransferStatus.pending)
  for (const transfer of transfers) {
    if (transfer.deposit!.timestamp) {
      const duration = Date.now() - transfer.deposit!.timestamp.getTime()
      const durationInMins = convertMillisecondsToMinutes(duration)
      if (durationInMins > Number(process.env.WARNING_TIME_MINUTES)) {
        const msg = await createMessage(process.env.WARNING_TEMPLATE_PATH!, transfer, durationInMins)
        await notificationSender.sendNotification({ Message: msg, TopicArn: process.env.TOPIC_ARN })
        logger.debug("Warning sent")
      }
    }
  }
}

export function getCronJob(cronTime: string | Date | DateTime, fn: Function, ...args: Parameters<any>): CronJob {
  return new CronJob(cronTime, () => {
    try {
      fn(...args)
    } catch (err) {
      logger.error("Error while executing cron job function", err)
    }
  })
}
