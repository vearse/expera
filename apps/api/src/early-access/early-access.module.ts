import { Module } from "@nestjs/common";
import { getRepositoryToken, TypeOrmModule } from "@nestjs/typeorm";
import type { Repository } from "typeorm";
import { isDatabaseConfigured } from "../config/database";
import { EarlyAccessController } from "./early-access.controller";
import { EarlyAccessService } from "./early-access.service";
import { WaitlistEntry } from "./entities/waitlist-entry.entity";

const dbImports = isDatabaseConfigured()
  ? [TypeOrmModule.forFeature([WaitlistEntry])]
  : [];

@Module({
  imports: dbImports,
  controllers: [EarlyAccessController],
  providers: [
    {
      provide: EarlyAccessService,
      useFactory: (repo?: Repository<WaitlistEntry>) =>
        new EarlyAccessService(repo ?? null),
      inject: isDatabaseConfigured()
        ? [getRepositoryToken(WaitlistEntry)]
        : [],
    },
  ],
})
export class EarlyAccessModule {}
