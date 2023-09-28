import { CronJob } from "cron"
import { DateTime } from "luxon"
import { Transfer, TransferStatus } from "@prisma/client"
import { PublishCommandInput } from "@aws-sdk/client-sns"
import { convertMillisecondsToMinutes } from "../../../utils/helpers"
import TransferRepository from "../../repository/transfer"
import { logger } from "../../../utils/logger"
import { NotificationSender } from "./notificationSender"

export enum NotificationType {
  INCIDENT = "Incident",
  WARNING = "Warning",
}

function getNotificationMessage(transfer: Transfer, durationInMins: number, notificationType: NotificationType): PublishCommandInput {
  if (notificationType == NotificationType.INCIDENT) {
    return {
      TopicArn: process.env.TOPIC_ARN,
      Message: `INCIDENT: Transfer with id ${transfer.id} is pending for ${Math.round(durationInMins)} minutes.`,
    }
  } else if (notificationType == NotificationType.WARNING) {
    return {
      TopicArn: process.env.TOPIC_ARN,
      Message: `WARNING: Transfer with id ${transfer.id} is pending for ${Math.round(durationInMins)} minutes.`,
    }
  } else {
    throw new TypeError("Invalid enum type")
  }
}

export async function checkTransferStatus(transferRepository: TransferRepository, notificationSender: NotificationSender): Promise<void> {
  logger.info("--- Checking pending transfers ---")

  const INCIDENT_TIME_MINUTES = 45
  const WARNING_TIME_MINUTES = 15

  const transfers = await transferRepository.findTransfersByStatus(TransferStatus.pending)

  for (const transfer of transfers) {
    const duration = Date.now() - transfer.timestamp.getTime()
    const durationInMins = convertMillisecondsToMinutes(duration)
    if (durationInMins > INCIDENT_TIME_MINUTES) {
      const message = getNotificationMessage(transfer, durationInMins, NotificationType.INCIDENT)
      await notificationSender.sendNotification(message)
      logger.info("Incident sent")
    } else if (durationInMins > WARNING_TIME_MINUTES) {
      const message = getNotificationMessage(transfer, durationInMins, NotificationType.WARNING)
      await notificationSender.sendNotification(message)
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
