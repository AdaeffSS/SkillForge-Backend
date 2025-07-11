import {
  Body,
  Controller,
  HttpCode, Param,
  Post, Put, Query,
  Req,
  Res,
  UseGuards
} from "@nestjs/common";
import { SessionsService } from "./sessions.service";
import { JwtAuthGuard } from "../auth/guards/auth.guard";
import { Request } from "express";
import { CreateSessionDto } from "./dto/create-session.dto";
import { RegisterEventDto } from "./dto/register-event.dto";

@UseGuards(JwtAuthGuard)
@Controller("sessions")
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post("create")
  async createSession(@Req() req: Request, @Body() body: CreateSessionDto) {
    return await this.sessionsService.createSession(body, req);
  }

  @HttpCode(200)
  @Post("event")
  async registerEvent(@Body() body: RegisterEventDto, @Req() req: Request) {
    return await this.sessionsService.registerEvent(body, req);
  }

  @Put(':id/add-tasks')
  async addTasks(
    @Param('id') sessionId: string,
    @Body() body: any,
    @Req() req: Request,
  ) {
    return await this.sessionsService.addTasks(sessionId, body, req);
  }
}
