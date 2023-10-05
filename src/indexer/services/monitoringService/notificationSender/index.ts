/*
The Licensed Work is (c) 2023 Sygma
SPDX-License-Identifier: LGPL-3.0-only
*/
import { PublishCommand, PublishCommandInput, SNSClient } from "@aws-sdk/client-sns"
import { logger } from "../../../../utils/logger"

export class NotificationSender {
  private snsClient: SNSClient

  constructor(region: string) {
    this.snsClient = new SNSClient({ region })
  }

  public async sendNotification(message: PublishCommandInput): Promise<void> {
    try {
      logger.debug(`Sending notification message: ${JSON.stringify(message)}`)
      await this.snsClient.send(new PublishCommand(message))
    } catch (err) {
      logger.error(`Error while sending SNS notification: ${JSON.stringify(err)}`)
    }
  }
}
