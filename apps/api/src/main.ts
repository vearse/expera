import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type { NextFunction, Request, Response } from "express";
import helmet from "helmet";
import { AppModule } from "./app.module";
import { API_VERSION_LABEL } from "./common/api-version";
import {
  FallbackExceptionFilter,
  HttpExceptionFilter,
} from "./common/http-exception.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: false });
  const webOrigin = process.env.WEB_ORIGIN ?? "http://127.0.0.1:3100";
  const extraOrigins = (process.env.CORS_ORIGINS ?? "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  app.enableCors({
    origin: [webOrigin, ...extraOrigins],
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: "cross-origin" },
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  );
  app.useGlobalFilters(new FallbackExceptionFilter(), new HttpExceptionFilter());

  app.setGlobalPrefix("api/v1");
  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader("X-API-Version", API_VERSION_LABEL);
    next();
  });

  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`Expera API listening on http://127.0.0.1:${port}`);
}

bootstrap();
