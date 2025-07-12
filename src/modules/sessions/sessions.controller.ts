import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from "@nestjs/common";
import { Request } from "express";

import { SessionsService } from "./sessions.service";
import { JwtAuthGuard } from "../auth/guards/auth.guard";

import { CreateSessionDto } from "./dto/create-session.dto";
import { RegisterEventDto } from "./dto/register-event.dto";

import { Session } from "./entities/session.entity";
import { TrainSession } from "./entities/train-session.entity";

@UseGuards(JwtAuthGuard)
@Controller("sessions")
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  
  @Get(':id')
  async getSession(
    @Param('id') id: string,
  ) {
    return await Session.findByPk(id, {
      include: [TrainSession]
    })
  }
  
  
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
    @Param('id') sessionId: number,
    @Body() body: any,
    @Req() req: Request,
  ) {
    return await this.sessionsService.addTasks(sessionId, body, req);
  }
}
