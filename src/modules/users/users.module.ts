import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { SequelizeModule } from "@nestjs/sequelize";
import { User } from "./entities/user.entity";
import { Task } from "@tasks/entities/task.entity";
import { Session } from "../sessions/entities/session.entity";

@Module({
  imports: [SequelizeModule.forFeature([User, Task, Session])],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
