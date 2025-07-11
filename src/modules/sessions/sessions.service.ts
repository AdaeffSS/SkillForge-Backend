import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Request } from "express";
import { CreateSessionDto } from "./dto/create-session.dto";
import { Session } from "./entities/session.entity";
import { RegisterEventDto } from "./dto/register-event.dto";
import { EventType, SessionEvent } from "./entities/session-event.entity";
import { TrainSession } from "./entities/train-session.entity";
import { TasksService } from "@tasks/tasks.service";
import { Exam, Sub } from "@tasks/enums";

@Injectable()
export class SessionsService {
  constructor(private readonly tasksService: TasksService) {}

  private createTrainSession(id: number, body: any): void {
    TrainSession.create({
      id: id,
      difficultyLevel: 1,
    }).then();
  }
  async createSession(body: CreateSessionDto, req: Request): Promise<any> {
    const session = await Session.create({
      userId: req.user.sub,
      type: body.type,
      ...(body.name ? { name: body.name } : {}),
      ...(body.expireAt ? { expireAt: body.expireAt } : {}),
    });
    this.createTrainSession(session.id, body);
    this.registerEvent(
      {
        sessionId: session.id,
        type: EventType.CREATE,
      },
      req,
    ).then();
    return `/sessions/${session.id}`;
  }
  async registerEvent(event: RegisterEventDto, req: Request) {
    const session: Session | null = await Session.findByPk(event.sessionId);
    if (!session) throw new NotFoundException("Session does not exist");

    switch (event.type) {
      case EventType.CREATE:
        if (
          await SessionEvent.findOne({
            where: { sessionId: event.sessionId, type: EventType.CREATE },
          })
        )
          throw new ConflictException("This session has already been created");
        break;
      case EventType.START:
        session.isOpen = true;
        session.save().then();
        break;
      case EventType.ADD_TASK:
        session.taskCount += 1;
        session.save().then();
        break;
    }

    if (session!.userId != req.user.sub)
      throw new ForbiddenException("The session was created by another user");

    await SessionEvent.create({
      sessionId: event.sessionId,
      type: event.type,
      ...(event.context ? { context: event.context } : {}),
    });
  }

  async addTasks(id: any, body: any, req: Request): Promise<any> {
    const session = await Session.findByPk(id);
    if (session?.userId != req.user.sub)
      throw new ForbiddenException(
        "The session was created by another user. You do not have access to add tasks to this session",
      );

    let tasks: any[] = [];

    for (const item of body) {
      for (let i = 0; i < item.count; i++) {
        const task = await this.tasksService.generateTask(
          Exam.OGE,
          Sub.INFO,
          item.type,
        );
        task.task.sessionId = id;
        task.task.save().then();
        tasks.push({id: task.task.id, body: task.body})
      }
    }
    return tasks;
  }
}
