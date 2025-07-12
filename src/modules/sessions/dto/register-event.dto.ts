import { IsEnum, IsInt, IsJSON, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";
import { EventType } from "../entities/session-event.entity";

export class RegisterEventDto {

  @IsInt()
  @IsNotEmpty()
  sessionId: number;

  @IsEnum(EventType)
  @IsNotEmpty()
  type: EventType;

  @IsOptional()
  @IsJSON()
  context?: any

}