import { CronJob } from "cron"
import { DateTime } from "luxon"
import { TransferStatus } from "@prisma/client"
import { convertMillisecondsToMinutes } from "utils/helpers"
import TransferRepository from "../../repository/transfer"
import { logger } from "../../../utils/logger"
import { NotificationSender } from "./notificationSender"

export async function checkTransferStatus(transferRepository: TransferRepository, notificationSender: NotificationSender): Promise<void> {
  logger.info("--- Checking pending transfers ---")

  const INCIDENT_TIME = 45
  const WARNING_TIME = 15

  const transfers = await transferRepository.findTransfersByStatus(TransferStatus.pending)

  for (const transfer of transfers) {
    const duration = Date.now() - transfer.timestamp.getTime()
    const durationInMins = convertMillisecondsToMinutes(duration)

    if (durationInMins > INCIDENT_TIME) {
      await notificationSender.sendNotification({ Message: "Incident" })
      logger.info("Incident sent")
    } else if (durationInMins > WARNING_TIME) {
      await notificationSender.sendNotification({ Message: "Warning" })
      logger.info("Warning sent")
    }
  }
}

export function startCronJob(cronTime: string | Date | DateTime, fn: Function, ...args: Parameters<any>): void {
  const cronJob = new CronJob(cronTime, () => {
    try {
      fn(...args)
    } catch (err) {
      logger.error("Error while executing cron job function", err)
    }
  })
  cronJob.start()
}
