import { IsDate, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { SessionType } from "../unums/session-type.enum";

export class CreateSessionDto {

  @IsEnum(SessionType)
  @IsNotEmpty()
  type: SessionType;

  @IsString()
  @IsOptional()
  taskCode: string;

  @IsOptional()
  @IsDate()
  expireAt: Date;

  @IsOptional()
  @IsString()
  configurationCode: string;

  @IsOptional()
  @IsString()
  name?: string;

}