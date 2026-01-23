// src/branch/branch.service.ts
import {
  BadRequestException,
  Inject,
  Injectable,
  LoggerService,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBranchDto, CreateBranchStockDto } from './dto/branch.dto';
import { isUUID } from 'class-validator';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
//import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class BranchService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
    //private readonly redisService: RedisService,
  ) {}

  async createBranch(data: CreateBranchDto) {
    return this.prisma.branch.create({
      data: {
        branchId: data.branchId,
        branchName: data.branchName,
        isBranchEnable:
          data.isBranchEnable !== undefined ? data.isBranchEnable : true,
        stores: {
          create: data.stores.map((store) => ({
            storeName: store.storeName,
            isStoreEnable:
              store.isStoreEnable !== undefined ? store.isStoreEnable : true,
          })),
        },
      },
      include: { stores: true },
    });
  }

  async updateStoresInBranch(
    branchId: string,
    stores: {
      storeId?: string;
      storeName: string;
      isStoreEnable: boolean;
      canLuckydraw: boolean;
      canBag: boolean;
    }[],
  ) {
    try {
      // Check if branch exists
      const existingBranch = await this.prisma.branch.findUnique({
        where: { branchId },
      });

      if (!existingBranch) {
        throw new NotFoundException(`Branch with ID ${branchId} not found.`);
      }

      // Update or create stores
      const updatedStores = await Promise.all(
        stores.map(async (store) => {
          if (store.storeId) {
            // Update existing store
            return this.prisma.store.update({
              where: { storeId: store.storeId },
              data: {
                storeName: store.storeName,
                isStoreEnable:
                  store.isStoreEnable !== undefined
                    ? store.isStoreEnable
                    : true,
              },
            });
          } else {
            // Create new store under branch
            return this.prisma.store.create({
              data: {
                storeName: store.storeName,
                isStoreEnable: store.isStoreEnable ? store.isStoreEnable : true,
                
                branch: { connect: { branchId } }, // Link store to the branch
              },
            });
          }
        }),
      );

      return {
        message: 'Stores updated successfully for the branch',
        data: updatedStores,
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to update stores: ${error.message}`,
      );
    }
  }

  async getAllBranches() {
    return this.prisma.branch.findMany({
      include: { stores: true },
    });
  }

  async getAvailableBranchesAndStores() {
    const cacheKey = 'available_branches_stores';

    // 1️⃣ Check if data is cached in Redis
    // const cachedData = await this.redisService.get(cacheKey);
    // if (cachedData) {
    //   this.logger.log(`Returning data from Redis cache: ${cacheKey}`);
    //   return cachedData; // Return cached data
    // }

    // 2️⃣ Fetch from database if cache is empty
    const data = await this.prisma.branch.findMany({
      where: { isBranchEnable: true },
      include: {
        stores: {
          where: { isStoreEnable: true },
        },
      },
    });

    // // 3️⃣ Cache the result in Redis (expires in 1 hour)
    // await this.redisService.set(cacheKey, data, 3600);

    // this.logger.log(
    //   `Fetched data from DB and stored in Redis cache: ${cacheKey}`,
    // );
    return data;
  }

  async getBranchStockAll(branchId: string) {
    try {
      // Check if branch exists
      const existingBranch = await this.prisma.branch.findUnique({
        where: { branchId },
      });
      if (!existingBranch) {
        throw new NotFoundException(`Branch with ID ${branchId} not found.`);
      }
      // Query branchStock table for the given branchId and isEnable true
      const branchStock = await this.prisma.branchStock.findMany({
        where: {  
          branchId: branchId,
          isEnable: true,
        },
      });
      this.logger.log(
        `Fetch branch stock branchId: ${branchId} :getBranchStockAll`,
      );
      return branchStock;
    } catch (error) {
      throw new BadRequestException(
        `Failed to get branchstock: ${error.message}`,
      );
    }
  }

  async getBranchStockRedeem(branchId: string, redeemId:string) {
    try {
      // Check if branch exists
      const existingBranch = await this.prisma.branch.findUnique({
        where: { branchId },
      });

      if (!existingBranch) {
        throw new NotFoundException(`Branch with ID ${branchId} not found.`);
      }

      // Query branchStock table for the given branchId and isEnable true
      const branchStock = await this.prisma.branchStock.findFirst({
        where: {
          branchId: branchId,
          redeemId: redeemId,
          isEnable: true,
        },
      });
      

      this.logger.log(
        `Fetch branch stock branchId: ${branchId} :getBranchStock`,
      );

      return branchStock;
    } catch (error) {
      throw new BadRequestException(
        `Failed to get branchstock: ${error.message}`,
      );
    }
  }

  async getBranchStockHist(branchId: string) {
    try {
      // Check if branch exists
      const existingBranch = await this.prisma.branch.findUnique({
        where: { branchId },
      });

      if (!existingBranch) {
        throw new NotFoundException(`Branch with ID ${branchId} not found.`);
      }

      // Query branchStock table for the given branchId and isEnable true
      const branchStockHist = await this.prisma.adminBranchHistory.findMany({
        where: {
          branchId: branchId,
          isEnable: true,
        },
      });

      this.logger.log(
        `Fetch branch stock branchId: ${branchId} :getBranchStockHist`,
      );

      return branchStockHist;
    } catch (error) {
      throw new BadRequestException(
        `Failed to get branchstock: ${error.message}`,
      );
    }
  }

  async updateBranchStock(data: CreateBranchStockDto) {
    const { branchId, redeemId, amount, isEnable, adminId } = data;

    try {
      //check adminId
      const Admin = await this.prisma.admin.findUnique({
        where: {
          adminId,
        },
      });
      const existingBranch = await this.prisma.branch.findUnique({
        where: { branchId },
      });
      if (!existingBranch) {
        throw new NotFoundException(`Branch ${branchId} does not exist`);
      }
      // Check if the branch stock already exists
      const existingBranchStock = await this.prisma.branchStock.findFirst({
        where: {
          branchId,
          redeemId,
        },
      });

      const currentTimestamp = new Date();

      if (existingBranchStock) {
        // Update the existing stock
        const updatedStock = await this.prisma.branchStock.update({
          where: {
            branchId_redeemId: {
              branchId: existingBranchStock.branchId
                ? existingBranchStock.branchId
                : '',
              redeemId: existingBranchStock.redeemId
                ? existingBranchStock.redeemId
                : '',
            },
          },
          data: {
            amount:
              amount !== undefined
                ? (existingBranchStock.amount || 0) + amount
                : existingBranchStock.amount,
            isEnable:
              isEnable !== undefined ? isEnable : existingBranchStock.isEnable,
            updatedAt: currentTimestamp,
          },
        });

        this.logger.log(
          `Updated branch stock for branchId: ${branchId}, redeemId: ${redeemId}`,
          'updateBranchStock',
        );

        // Prepare additional variables to include in the response
        const updatedStatus = isEnable !== undefined; // ถ้าส่ง isEnable มา ให้บอกด้วยว่า อัพเดทสถานะด้วยนะ
        const updatedIsEnable =
          updatedStock.isEnable !== null ? updatedStock.isEnable : false;

        await this.prisma.adminBranchHistory.create({
          data: {
            branchId,
            adminId,
            redeemId,
            editDate: new Date(),
            amount: amount ? amount : 0,

            updatedStatus,
            isEnable: updatedIsEnable,
            username: Admin?.username,
          },
        });

        return {
          message: `Updated branch stock successfully`,
          data: updatedStock,
          additionalInfo: {
            amount: amount !== undefined ? amount : null,

            updatedStatus, // Whether `isEnable` was updated
            isEnable: updatedIsEnable, // Final value of `isEnable`
          },
        };
      } else {
        // Create a new stock entry
        const newStock = await this.prisma.branchStock.create({
          data: {
            branchId,
            branchName: existingBranch.branchName,
            redeemId,
            amount: amount || 0,
            isEnable: isEnable || true,
          },
        });

        this.logger.log(
          `Created new branch stock for branchId: ${branchId}, redeemId: ${redeemId}`,
          'updateBranchStock',
        );

        await this.prisma.adminBranchHistory.create({
          data: {
            branchId,
            adminId,
            redeemId,
            editDate: new Date(),
            amount: amount ? amount : 0,

            updatedStatus: false,
            isEnable: true,
            username: Admin?.username,
          },
        });

        return {
          message: `สร้างสินค้าแลกซื้อ เป็นจำนวน ${amount}`,
          data: newStock,
        };
      }
    } catch (error) {
      this.logger.error(
        `Failed to update branch stock for branchId: ${branchId}, redeemId: ${redeemId}`,
        error.stack,
        'updateBranchStock',
      );
      throw new BadRequestException(
        `An error occurred while updating branch stock: ${error.message}`,
      );
    }
  }

  async updateStoreStatus(
    branchId: string,
    storeId: string,
    isStoreEnable: boolean,
  ) {
    const store = await this.prisma.store.updateMany({
      where: { branchId, storeId },
      data: { isStoreEnable },
    });

    if (store.count === 0) {
      this.logger.error(
        'Store with ID under branch ID  not found',
        storeId,
        branchId,
        ':updateBranchStatus',
      );
      throw new NotFoundException(
        `Store with ID ${storeId} under branch ID ${branchId} not found`,
      );
    }

    this.logger.log(
      `Updated status in branch ${branchId} storeId ${storeId} to status ${isStoreEnable}`,
      'updateStoreStatus',
    );

    return {
      message: `Store status updated successfully`,
      storeId,
      branchId,
    };
  }

  async updateBranchStatus(branchId: string, isBranchEnable: boolean) {
    const store = await this.prisma.branch.updateMany({
      where: { branchId },
      data: { isBranchEnable },
    });

    this.logger.log(
      `Updated status in branch ${branchId} to status ${isBranchEnable}`,
      'updateStoreStatus',
    );

    return {
      message: `Branch status updated successfully`,
      branchId,
    };
  }
}
