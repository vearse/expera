import { BadRequestException, Controller, Get, Param } from "@nestjs/common";
import { ModulesService } from "./modules.service";
import type { ModuleKind, ModuleSubject } from "@expera/shared";

const SUBJECTS: ModuleSubject[] = ["chemistry", "biology", "physics"];
const KINDS: ModuleKind[] = ["learn", "lab"];

function parseSubject(raw: string): ModuleSubject {
  if (!SUBJECTS.includes(raw as ModuleSubject)) throw new BadRequestException("Invalid subject");
  return raw as ModuleSubject;
}

function parseKind(raw: string): ModuleKind {
  if (!KINDS.includes(raw as ModuleKind)) throw new BadRequestException("Invalid kind");
  return raw as ModuleKind;
}

@Controller("modules")
export class ModulesController {
  constructor(private readonly modules: ModulesService) {}

  @Get(":subject/:kind")
  list(@Param("subject") subjectRaw: string, @Param("kind") kindRaw: string) {
    return this.modules.list(parseSubject(subjectRaw), parseKind(kindRaw));
  }

  @Get(":subject/:kind/:id")
  findOne(@Param("subject") subjectRaw: string, @Param("kind") kindRaw: string, @Param("id") id: string) {
    return this.modules.findOne(parseSubject(subjectRaw), parseKind(kindRaw), id);
  }
}
