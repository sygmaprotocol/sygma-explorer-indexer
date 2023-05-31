/* import { logger } from "utils/logger";
import { DepositRepository, ExecutionRepository } from "../../repositories";

export async function connectExecutionToDeposit(
  executionRepository: ExecutionRepository,
  depositRepository: DepositRepository
  transferRepository: TransferRepository
): Promise<void> {
  const executions = await executionRepository.findUnmappedExecutions();
  for await (const execution of executions) {
    const matchingDeposit = await depositRepository.findOne({
      where: {
        destination: execution.domainID,
        depositNonce: execution.depositNonce,
      },
    });

    if (!matchingDeposit) {
      logger.info(`No matching deposit for execution: ${execution.txHash}`);
    } else {
      await transferRepository.update(execution.txHash, {
        depositID: matchingDeposit.id,
      });
    }
  }
}
 */
