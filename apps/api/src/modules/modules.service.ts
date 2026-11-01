import { Injectable, NotFoundException } from "@nestjs/common";
import { getModuleDetail, listModuleIds, type ModuleKind, type ModuleSubject } from "@expera/shared";

@Injectable()
export class ModulesService {
  findOne(subject: ModuleSubject, kind: ModuleKind, id: string) {
    const detail = getModuleDetail({ subject, kind, id });
    if (!detail) throw new NotFoundException(`Module not found: ${subject}/${kind}/${id}`);
    return detail;
  }

  list(subject: ModuleSubject, kind: ModuleKind) {
    return listModuleIds(subject, kind);
  }
}
