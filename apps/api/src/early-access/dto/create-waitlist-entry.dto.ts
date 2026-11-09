import { EARLY_ACCESS_ROLES } from "../early-access.constants";
import { Transform } from "class-transformer";
import { IsEmail, IsIn, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

const ROLES = EARLY_ACCESS_ROLES as unknown as string[];

function trimString({ value }: { value: unknown }) {
  return typeof value === "string" ? value.trim() : value;
}

export class CreateWaitlistEntryDto {
  @Transform(trimString)
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  fullName!: string;

  @Transform(({ value }) =>
    typeof value === "string" ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @Transform(trimString)
  @IsIn(ROLES)
  role!: string;

  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(200)
  institution?: string;
}
