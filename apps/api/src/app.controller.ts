import { Controller, Get } from "@nestjs/common";
import { API_VERSION, API_VERSION_LABEL } from "./common/api-version";

@Controller()
export class AppController {
  @Get("health")
  health() {
    return {
      ok: true,
      service: "expera-api",
      version: API_VERSION,
      apiVersion: API_VERSION_LABEL,
    };
  }
}
