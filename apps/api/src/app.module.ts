import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller";
import { isDatabaseConfigured } from "./config/database";
import { EarlyAccessModule } from "./early-access/early-access.module";
import { WaitlistEntry } from "./early-access/entities/waitlist-entry.entity";
import { ModulesModule } from "./modules/modules.module";

const imports = [
  ConfigModule.forRoot({ isGlobal: true }),
  ThrottlerModule.forRoot([
    {
      ttl: 60_000,
      limit: 120,
    },
  ]),
  ModulesModule,
  EarlyAccessModule,
];

if (isDatabaseConfigured()) {
  imports.splice(
    1,
    0,
    TypeOrmModule.forRoot({
      type: "mysql",
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT ?? 3306),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD ?? "",
      database: process.env.DB_DATABASE,
      entities: [WaitlistEntry],
      synchronize: process.env.DB_SYNCHRONIZE === "true",
    }),
  );
}

@Module({
  imports,
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
