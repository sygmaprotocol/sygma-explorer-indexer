import { CronJob } from 'cron'
import TransferRepository from '../../repository/transfer';
import { logger } from '../../../utils/logger';
import { DateTime } from 'luxon';
import { NotificationSender } from './notificationSender';

export async function checkTransferStatus(transferRepository: TransferRepository): Promise<void>{

    const notificationSender = new NotificationSender("region")

    const transfers = await transferRepository.findTransfersByStatus("pending")
    console.log("--- Cronjob is running ---")

    for (let transfer of transfers){
        if (transfer.timestamp) {
            let duration = (new Date()).getTime() - transfer.timestamp.getTime()
            const durationInMins = duration / 1000 / 60 
            
            if (durationInMins > 45) {
                notificationSender.sendNotification({Message: "..."})
                console.log("Incident sent")
            } else if (durationInMins > 15){
                notificationSender.sendNotification({Message: "..."})
                console.log("Warning sent")
            }
        }
    }
}

export function startCronJob(cronTime: string | Date | DateTime, fn: Function, ...args: Parameters<any>){ 
    const cronJob = new CronJob(cronTime, async() => {
        try {
            await fn(...args)
        } catch (err){    
            console.log("Error while executing cron job function")
            logger.error(err)
        }
    })
    cronJob.start()
}


