import { Body, Controller, Post } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { CreateWaitlistEntryDto } from "./dto/create-waitlist-entry.dto";
import { EarlyAccessService } from "./early-access.service";

@Controller("early-access")
export class EarlyAccessController {
  constructor(private readonly earlyAccess: EarlyAccessService) {}

  @Post()
  @Throttle({ default: { limit: 6, ttl: 60_000 } })
  create(@Body() body: CreateWaitlistEntryDto) {
    return this.earlyAccess.register(body);
  }
}
