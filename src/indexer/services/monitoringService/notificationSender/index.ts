import {
    PublishCommand,
    PublishCommandInput,
    SNSClient,
  } from "@aws-sdk/client-sns";
  import {logger} from "../../../../utils/logger";
  
  export class NotificationSender {
    private snsClient: SNSClient;
  
    constructor(region: string) {
      this.snsClient = new SNSClient({ region });
    }
  
    public async sendNotification(message: PublishCommandInput): Promise<void> {
      try {
        logger.debug("Sending notification Message: " + JSON.stringify(message));
        const data = await this.snsClient.send(new PublishCommand(message));
        logger.debug(
          "SNS notification sent successfully: " + JSON.stringify(data)
        );
      } catch (err) {
        logger.error(
          "Error while sending sns notification: " + JSON.stringify(err)
        );
      }
    }
  }