import { IsDate, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { SessionType } from "../unums/session-type.enum";

export class CreateSessionDto {

  @IsEnum(SessionType)
  @IsNotEmpty()
  type: SessionType;

  @IsString()
  code: string;

  @IsOptional()
  @IsDate()
  expireAt: Date;

  @IsOptional()
  @IsString()
  task: string;

  @IsOptional()
  @IsString()
  name?: string;

}