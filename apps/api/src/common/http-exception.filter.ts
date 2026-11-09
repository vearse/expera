import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import type { Response } from "express";

type ErrorBody = { error: string; issues?: unknown };

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const payload = exception.getResponse();

    let error = "Request failed.";
    let issues: unknown;

    if (typeof payload === "string") {
      error = payload;
    } else if (payload && typeof payload === "object") {
      const body = payload as Record<string, unknown>;
      const message = body.message;
      if (Array.isArray(message)) {
        error = "Validation failed.";
        issues = body;
      } else if (typeof message === "string") {
        error =
          status === 429
            ? "Too many attempts. Please wait a minute and try again."
            : message;
      } else if (typeof body.error === "string") {
        error = body.error;
      }
    }

    const json: ErrorBody = { error };
    if (issues !== undefined) json.issues = issues;

    response.status(status).json(json);
  }
}

@Catch()
export class FallbackExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    // eslint-disable-next-line no-console
    console.error("[expera-api] unhandled error", exception);
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      error: "Something went wrong. Try again shortly.",
    });
  }
}
