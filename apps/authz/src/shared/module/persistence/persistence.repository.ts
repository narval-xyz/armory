import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { mockEntityData, userAddressStore } from "./mock_data";

@Injectable()
export class PersistenceRepository implements OnModuleInit {
  private logger = new Logger(PersistenceRepository.name)

  async onModuleInit() {
    this.logger.log('PersistenceRepository initialized')
  }

  async getEntityData() {
    const data = mockEntityData;
    return data;
  }

  async getUserForAddress(address: string): Promise<string> {
    const userId = userAddressStore[address]
    if (!userId) throw new Error(`Could not find user for address ${address}`)
    return userId;
  }
}