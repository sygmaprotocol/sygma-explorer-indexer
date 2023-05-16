import { PrismaClient, TransferStatus } from "@prisma/client"
import { returnQueryParamsForTransfers } from "../utils/helpers"

export type TransfersByCursorOptions = {
  page: string;
  limit: string;
  status?: TransferStatus;
  [key: string]: string | undefined;
};

class TransfersService {
  public transfers = new PrismaClient().transfer
  private currentCursor: string | undefined;

  private prepareQueryParams(args: TransfersByCursorOptions) {
    const { page, limit, ...rest } = args;

    const pageSize = parseInt(limit, 10);
    const pageIndex = parseInt(page, 10) - 1;
    const skip = pageIndex * pageSize;

    const where = rest ? { ...rest } : { };

    return {
      pageSize,
      skip,
      where
    }
  }

  public async findTransferById({ id }: { id: string }) {
    try {
      const transfer = await this.transfers.findUnique({
        where: { id },
        include: {
          ...returnQueryParamsForTransfers().include,
        }
      })
      return transfer;
    } catch (error) {
      console.error(error);
      throw new Error('No transfer found');
    }
  }

  public async findTransfersByCursor(args: TransfersByCursorOptions) {
    const { page, limit, status } = args;

    const pageSize = parseInt(limit, 10);
    const pageIndex = parseInt(page, 10) - 1;
    const skip = pageIndex * pageSize;

    const where = status ? { status } : { };

    const transfers = await this.transfers.findMany({
      where,
      take: pageSize + 1,
      skip: this.currentCursor ? 0 : skip,
      cursor: this.currentCursor ? { id: this.currentCursor } : undefined,
      orderBy: [{
        timestamp: "asc",
      }],
      include: {
        ...returnQueryParamsForTransfers().include
      }
    })
    
    const transferWithoutTheLastItem = transfers.slice(0, pageSize)
    
    this.currentCursor = transferWithoutTheLastItem[transfers.length - 1]?.id;

    return transferWithoutTheLastItem;
  }

  public async findTransferByFilterParams(args: TransfersByCursorOptions){
    const { page, limit, status, sender } = args;
    const queryParams = this.prepareQueryParams({ page, limit, status, sender });
    const { pageSize, skip, where } = queryParams;
    
    const transfer = await this.transfers.findMany({
      where,
      take: pageSize + 1,
      skip: this.currentCursor ? 0 : skip,
      cursor: this.currentCursor ? { id: this.currentCursor } : undefined,
      orderBy: [{
        timestamp: "asc",
      }],
      include: {
        ...returnQueryParamsForTransfers().include
      }
    });

    const transferWithoutTheLastItem = transfer.slice(0, pageSize)

    this.currentCursor = transferWithoutTheLastItem[transfer.length - 1]?.id;

    return transferWithoutTheLastItem;
  }

}
export default TransfersService
